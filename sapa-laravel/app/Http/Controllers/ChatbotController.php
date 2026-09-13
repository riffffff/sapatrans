<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $userMessage = $request->input('message');

        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Gemini API Key belum dipasang di .env'
            ], 500);
        }

        try {
            // 1. Ambil data halte dari database (MENGGUNAKAN KOLOM ASLI SUPABASE)
            $halteData = DB::table('activity_utm_exp')
                ->select(
                    'id',
                    'id_mapid',
                    'halte_ona', // Kolom nama halte
                    'user_name', // Pengganti surveyor
                    'tanggal',
                    'jalur',
                    'kelas',
                    'skor_final',
                    'lat',
                    'long',
                    'jenis_halt',
                    'fas_atap',
                    'kondisi_at',
                    'fas_ramp',
                    'kondisi_ra',
                    'fas_pegawa',
                    'fas_tempat',
                    'fas_papan_',
                    'fas_lampu',
                    'fas_trotoa',
                    'kondisi_tr',
                    'fas_guildi',
                    'kondisi_gu',
                    'fas_penyeb',
                    'jenis_peny',
                    'skor_fas',
                    'skor_kondi',
                    'skor_total'
                )
                ->get();

            // 2. System instruction untuk Gemini
            $systemInstruction =
                "Kamu adalah SAPA AI, asisten transportasi dan aksesibilitas Trans Jogja.\n\n"

                . "DATA HALTE TRANS JOGJA:\n"
                . json_encode($halteData, JSON_UNESCAPED_UNICODE)
                . "\n\n"

                . "KETERANGAN KOLOM DATA:\n"
                . "- halte_ona = nama utama halte. Selalu gunakan ini sebagai nama halte.\n"
                . "- lat = latitude halte.\n"
                . "- long = longitude halte.\n"
                . "- fas_ramp = ketersediaan fasilitas ramp untuk kursi roda.\n"
                . "- fas_guildi = ketersediaan guiding block.\n\n"

                . "ATURAN:\n"
                . "1. Jawab berdasarkan data halte yang tersedia di atas.\n"
                . "2. Jangan mengarang nama halte, fasilitas, atau koordinat.\n"
                . "3. Gunakan halte_ona sebagai nama halte.\n"
                . "4. Jika pengguna menanyakan halte di suatu wilayah (contoh: Malioboro atau UGM), cari halte yang nama atau lokasinya paling dekat dengan wilayah tersebut.\n"
                . "5. PENTING - TARGET LOCATION: Jika pengguna menanyakan lokasi atau halte tertentu, kamu Wajib mengambil nilai 'long' dan 'lat' yang valid dari baris data halte tersebut, lalu masukkan ke 'target_location' dengan format [longitude, latitude] (tipe data angka/float).\n"
                . "6. Jika tidak ada halte atau lokasi khusus yang perlu ditampilkan di peta, set target_location ke null.\n"
                . "7. Jawab dengan bahasa Indonesia yang ramah, singkat, dan mudah dipahami.\n\n"

                . "OUTPUT WAJIB JSON VALID:\n"
                . "{\n"
                . '  "reply": "Jawaban untuk pengguna.",' . "\n"
                . '  "target_location": [110.3657598, -7.9347791] atau null,' . "\n"
                . '  "zoom_level": 15.5 atau null,' . "\n"
                . '  "filter_kelas": []' . "\n"
                . "}";

            // 3. Panggil Gemini API
            $response = Http::timeout(60)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])
                ->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
                    [
                        'systemInstruction' => [
                            'parts' => [
                                ['text' => $systemInstruction]
                            ]
                        ],
                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [
                                    ['text' => $userMessage]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json'
                        ]
                    ]
                );

            if ($response->failed()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini API mengalami error.',
                    'error' => $response->json()
                ], 500);
            }

            $jsonResult = $response->json();
            $aiRawText = $jsonResult['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $aiData = json_decode($aiRawText, true);

            if (!is_array($aiData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Respons Gemini tidak dapat diproses.'
                ], 500);
            }

            // Pastikan format target_location berupa array float [longitude, latitude] agar peta tidak error
            $targetLocation = null;
            if (isset($aiData['target_location']) && is_array($aiData['target_location']) && count($aiData['target_location']) >= 2) {
                // Gunakan str_replace agar koma yang mungkin ada dari database diubah jadi titik desimal
                $lon = (float) str_replace(',', '.', $aiData['target_location'][0]);
                $lat = (float) str_replace(',', '.', $aiData['target_location'][1]);
                $targetLocation = [$lon, $lat];
            }

            return response()->json([
                'success' => true,
                'reply' => $aiData['reply'] ?? 'Maaf, saya tidak dapat memahami pertanyaan tersebut.',
                'map_action' => [
                    'center' => $targetLocation,
                    'zoom' => isset($aiData['zoom_level']) ? (float)$aiData['zoom_level'] : null,
                    'filter_kelas' => $aiData['filter_kelas'] ?? []
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Chatbot Controller Exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}