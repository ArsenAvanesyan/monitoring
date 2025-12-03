import React, { useState } from 'react';

const AccessDataCard = ({ 
    accessData, 
    accessDataArray, 
    accessHexData, 
    accessTimestamp, 
    isLoadingAccessData,
    hasRealData,
    hasTestData,
    onRefresh,
    onClear
}) => {
    const [showHex, setShowHex] = useState(false);
    const [showMinersTable, setShowMinersTable] = useState(true);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    if (!accessData && accessDataArray.length === 0) {
        return null;
    }

    return (
        <div className="card bg-base-200 shadow-xl border border-secondary mb-8">
            <div className="card-body">
                {/* Предупреждение, если только тестовые данные */}
                {hasTestData && !hasRealData && (
                    <div className="alert alert-warning mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-bold">Отображаются только тестовые данные!</h3>
                            <div className="text-xs">Запустите access.exe для получения реальных данных от майнеров.</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title text-lg text-primary">
                        📊 Данные от access.exe
                        {accessDataArray.length > 0 && (
                            <span className="badge badge-primary badge-sm ml-2">
                                {accessDataArray.length} майнеров
                            </span>
                        )}
                        {hasRealData && (
                            <span className="badge badge-success badge-sm ml-2">
                                Реальные данные
                            </span>
                        )}
                        {hasTestData && !hasRealData && (
                            <span className="badge badge-warning badge-sm ml-2">
                                Только тестовые
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        {accessTimestamp && (
                            <span className="text-xs text-primary/70">
                                Обновлено: {formatTimestamp(accessTimestamp)}
                            </span>
                        )}
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={onRefresh}
                            disabled={isLoadingAccessData}
                            title="Обновить данные"
                        >
                            {isLoadingAccessData ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            )}
                        </button>
                        <button
                            className="btn btn-sm btn-error btn-outline"
                            onClick={onClear}
                            title="Очистить данные"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Вкладки для переключения между таблицей майнеров, JSON и Hex */}
                <div className="tabs tabs-boxed mb-4">
                    {accessDataArray.length > 0 && (
                        <button
                            className={`tab ${showMinersTable && !showHex ? 'tab-active' : ''}`}
                            onClick={() => { setShowMinersTable(true); setShowHex(false); }}
                        >
                            Майнеры ({accessDataArray.length})
                        </button>
                    )}
                    <button
                        className={`tab ${!showMinersTable && !showHex ? 'tab-active' : ''}`}
                        onClick={() => { setShowMinersTable(false); setShowHex(false); }}
                    >
                        JSON
                    </button>
                    {accessHexData && (
                        <button
                            className={`tab ${showHex ? 'tab-active' : ''}`}
                            onClick={() => { setShowMinersTable(false); setShowHex(true); }}
                        >
                            Hex
                        </button>
                    )}
                </div>

                {/* JSON данные */}
                {!showMinersTable && !showHex && (
                    <div className="bg-base-300 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-xs text-primary whitespace-pre-wrap break-words font-mono">
                            {JSON.stringify(accessData, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Hex данные */}
                {!showMinersTable && showHex && accessHexData && (
                    <div className="bg-base-300 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-xs text-primary whitespace-pre font-mono">
                            {accessHexData}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessDataCard;

