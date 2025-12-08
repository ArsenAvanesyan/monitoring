import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshIcon, CalendarIcon } from '../../svg/icons';

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
                                <RefreshIcon className="w-4 h-4" />
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
                            <CalendarIcon className="w-4 h-4" />
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

