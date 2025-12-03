import React from 'react';
import { useTranslation } from 'react-i18next';

const ChartsSection = ({ timeRange, onTimeRangeChange }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hashrate Over Time */}
            <div className="card bg-base-200 shadow-xl border border-secondary">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="card-title text-lg text-primary">{t('dashboard.hashrateOverTime')}</h2>
                            <p className="text-sm text-primary">{t('dashboard.realTimePerformance')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="join">
                                <button
                                    className={`btn btn-sm join-item ${timeRange === '24h' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => onTimeRangeChange('24h')}
                                >
                                    24h
                                </button>
                                <button
                                    className={`btn btn-sm join-item ${timeRange === '7d' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => onTimeRangeChange('7d')}
                                >
                                    7d
                                </button>
                            </div>
                            <button className="btn btn-ghost btn-sm btn-circle">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center text-primary">
                        <div className="text-center">
                            <p className="mb-2 text-primary">График хешрейта</p>
                            <p className="text-xs text-primary">Здесь будет график с использованием библиотеки для графиков</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Temperature Distribution */}
            <div className="card bg-base-200 shadow-xl border border-secondary">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="card-title text-lg text-primary">{t('dashboard.temperatureDistribution')}</h2>
                            <p className="text-sm text-primary">{t('dashboard.deviceTemperatureRanges')}</p>
                        </div>
                        <button className="btn btn-ghost btn-sm btn-circle">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="h-64 flex items-center justify-center text-primary">
                        <div className="text-center">
                            <p className="mb-2 text-primary">График распределения температуры</p>
                            <p className="text-xs text-primary">Здесь будет график с использованием библиотеки для графиков</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartsSection;

