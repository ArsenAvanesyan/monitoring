import React, { useState } from 'react';
import { WarningIcon, RefreshIcon, DeleteIcon } from '../../svg/icons';

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
                        <WarningIcon className="stroke-current shrink-0 h-6 w-6" />
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
                                <RefreshIcon className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            className="btn btn-sm btn-error btn-outline"
                            onClick={onClear}
                            title="Очистить данные"
                        >
                            <DeleteIcon className="w-4 h-4" />
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

