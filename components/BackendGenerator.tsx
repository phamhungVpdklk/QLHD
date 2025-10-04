import React, { useState, useCallback } from 'react';
import { generateBackendCode } from '../services/geminiService';

const BackendGenerator: React.FC = () => {
  const [description, setDescription] = useState<string>(
    "Viết một ứng dụng backend hoàn chỉnh bằng Node.js và Express.js. Ứng dụng này cần có các API để: Tạo hợp đồng mới với logic cấp số tuần tự, không trùng lặp, dùng transaction. Lấy danh sách tất cả hợp đồng. Cập nhật hợp đồng (chỉnh sửa, thanh lý, hủy). Kết nối tới database PostgreSQL."
  );
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError('Vui lòng cung cấp mô tả cho ứng dụng backend.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCode('');
    try {
      const code = await generateBackendCode(description);
      setGeneratedCode(code.replace(/```javascript|```typescript|```/g, '').trim());
    } catch (err) {
      setError('Không thể tạo mã nguồn backend. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [description]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Tạo Mã nguồn Backend</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Mô tả các yêu cầu API của bạn, và AI sẽ tạo một backend Node.js/Express cho bạn.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="description-backend" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Yêu cầu Backend
          </label>
          <textarea
            id="description-backend"
            rows={5}
            className="w-full p-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ví dụ: Một ứng dụng Express với các API để tạo, đọc và cập nhật hợp đồng..."
          />
        </div>
        
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tạo...
            </>
          ) : (
            'Tạo Mã nguồn Backend'
          )}
        </button>

        {generatedCode && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Mã nguồn Node.js/Express đã tạo:</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendGenerator;