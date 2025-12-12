import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '../ui/Checkbox';

export const confFieldsList = [
  { key: 'workMode', label: 'Work Mode' },
  { key: 'freqMode', label: 'Freq Mode' },
  { key: 'freqLevel', label: 'Freq Level' },
  { key: 'targetVoltage', label: 'Voltage' },
  { key: 'targetTemp', label: 'Temp' },
  { key: 'confUrl1', label: 'Conf. URL1' },
  { key: 'confUrl2', label: 'Conf. URL2' },
  { key: 'confUrl3', label: 'Conf. URL3' },
  { key: 'confUser1', label: 'Conf. User1' },
  { key: 'confUser2', label: 'Conf. User2' },
  { key: 'confUser3', label: 'Conf. User3' },
  { key: 'fanCtrl', label: 'Fan Ctrl' },
  { key: 'fanPWM', label: 'Fan PWM' },
  { key: 'ignoreFan', label: 'Ignore fan' },
  { key: 'fanLimit', label: 'Fan Limit' },
  { key: 'fchain0', label: 'Fchain1' },
  { key: 'fchain1', label: 'Fchain2' },
  { key: 'fchain2', label: 'Fchain3' },
  { key: 'hfCtrl', label: 'HF Ctrl' },
  { key: 'hfPercent', label: 'HF Perc.' },
  { key: 'hfUrl1', label: 'HF Url1' },
  { key: 'hfUrl2', label: 'HF Url2' },
  { key: 'hfUrl3', label: 'HF Url3' },
  { key: 'hfUser1', label: 'HF User1' },
  { key: 'hfUser2', label: 'HF User2' },
  { key: 'hfUser3', label: 'HF User3' },
  { key: 'scheduleCtrl', label: 'Schedule Control' },
  { key: 'scheduleStart1', label: 'Schedule Start 1' },
  { key: 'scheduleStop1', label: 'Schedule Stop 1' },
  { key: 'scheduleWeekChoice1', label: 'Schedule Days 1' },
  { key: 'scheduleStart2', label: 'Schedule Start 2' },
  { key: 'scheduleStop2', label: 'Schedule Stop 2' },
  { key: 'scheduleWeekChoice2', label: 'Schedule Days 2' },
  { key: 'scheduleStart3', label: 'Schedule Start 3' },
  { key: 'scheduleStop3', label: 'Schedule Stop 3' },
  { key: 'scheduleWeekChoice3', label: 'Schedule Days 3' },
  { key: 'scheduleStart4', label: 'Schedule Start 4' },
  { key: 'scheduleStop4', label: 'Schedule Stop 4' },
  { key: 'scheduleWeekChoice4', label: 'Schedule Days 4' },
  { key: 'scheduleStart5', label: 'Schedule Start 5' },
  { key: 'scheduleStop5', label: 'Schedule Stop 5' },
  { key: 'scheduleWeekChoice5', label: 'Schedule Days 5' },
];

export const apiFieldsList = [
  { key: 'type', label: 'Type' },
  { key: 'subtype', label: 'SubType' },
  { key: 'brand', label: 'Brand' },
  { key: 'url', label: 'url 1' },
  { key: 'url1', label: 'url 2' },
  { key: 'url2', label: 'url 3' },
  { key: 'user', label: 'user 1' },
  { key: 'user1', label: 'user 2' },
  { key: 'user2', label: 'user 3' },
  { key: 'compileTime', label: 'Compile Time' },
  { key: 'rate_5s', label: 'Rate 5s' },
  { key: 'rate_30m', label: 'Rate 30m' },
  { key: 'rate_avg', label: 'Rate Avg' },
  { key: 'fan', label: 'Fan' },
  { key: 'temp_chip', label: 'Temp Chip' },
  { key: 'chain_num', label: 'Chain Num' },
  { key: 'asic_num', label: 'Asic Num' },
  { key: 'chainSN', label: 'Chain SN' },
  { key: 'elapsed', label: 'Elapsed' },
];

export const hiddenApiFields = [
  { key: 'alive', label: 'alive 1' },
  { key: 'alive1', label: 'alive 2' },
  { key: 'alive2', label: 'alive 3' },
];

export const serialNumberList = [{ key: 'serialNumber', label: 'SN Hardware' }];

export const firmwareList = [
  { key: 'firmware', label: 'SN Firmware' },
  { key: 'bVersion', label: 'Base Version' },
  { key: 'activation', label: 'Activation' },
  { key: 'blink', label: 'Blink' },
];

const ColumnsModal = ({
  isOpen,
  onClose,
  confEnabled,
  setConfEnabled,
  confFields,
  setConfFields,
  apiEnabled = false,
  setApiEnabled,
  apiFields = [],
  setApiFields,
  firmwareEnabled = false,
  setFirmwareEnabled,
  firmwareFields = [],
  setFirmwareFields,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const scheduleDaysKeys = [
    'scheduleWeekChoice1',
    'scheduleWeekChoice2',
    'scheduleWeekChoice3',
    'scheduleWeekChoice4',
    'scheduleWeekChoice5',
  ];

  const scheduleTimeKeys = [
    'scheduleStart1',
    'scheduleStop1',
    'scheduleStart2',
    'scheduleStop2',
    'scheduleStart3',
    'scheduleStop3',
    'scheduleStart4',
    'scheduleStop4',
    'scheduleStart5',
    'scheduleStop5',
  ];

  const otherConfFields = confFieldsList.filter(
    (f) => !scheduleDaysKeys.includes(f.key) && !scheduleTimeKeys.includes(f.key)
  );

  const scheduleDaysChecked = scheduleDaysKeys.every((key) => confFields.includes(key));
  const scheduleDaysIndeterminate =
    !scheduleDaysChecked && scheduleDaysKeys.some((key) => confFields.includes(key));

  const scheduleTimeChecked = scheduleTimeKeys.every((key) => confFields.includes(key));
  const scheduleTimeIndeterminate =
    !scheduleTimeChecked && scheduleTimeKeys.some((key) => confFields.includes(key));

  const handleScheduleDaysToggle = (checked) => {
    if (checked) {
      setConfFields((prev) => [...new Set([...prev, ...scheduleDaysKeys])]);
    } else {
      setConfFields((prev) => prev.filter((key) => !scheduleDaysKeys.includes(key)));
    }
  };

  const handleScheduleTimeToggle = (checked) => {
    if (checked) {
      setConfFields((prev) => [...new Set([...prev, ...scheduleTimeKeys])]);
    } else {
      setConfFields((prev) => prev.filter((key) => !scheduleTimeKeys.includes(key)));
    }
  };

  const allFirmwareKeys = [
    ...serialNumberList.map((f) => f.key),
    ...firmwareList.map((f) => f.key),
  ];

  const allConfKeys = confFieldsList.map((f) => f.key);
  const allApiKeys = apiFieldsList.map((f) => f.key);
  const allApiKeysWithHidden = [...allApiKeys, ...hiddenApiFields.map((f) => f.key)];

  const apiIntermediateFields = [
    'type',
    'url',
    'user',
    'alive',
    'url1',
    'user1',
    'alive1',
    'url2',
    'user2',
    'alive2',
    'rate_5s',
    'chain_num',
    'asic_num',
    'elapsed',
  ];

  const confIntermediateFields = [
    'workMode',
    'freqMode',
    'freqLevel',
    'targetVoltage',
    'targetTemp',
    'confUrl1',
    'confUser1',
    'confUrl2',
    'confUser2',
    'confUrl3',
    'confUser3',
    'fanCtrl',
  ];

  const firmwareIntermediateFields = ['serialNumber', 'bVersion', 'blink'];

  const apiChecked = apiFields.length === allApiKeysWithHidden.length;
  const apiIndeterminate = apiFields.length > 0 && apiFields.length < allApiKeysWithHidden.length;

  const confChecked = confFields.length === allConfKeys.length;
  const confIndeterminate = confFields.length > 0 && confFields.length < allConfKeys.length;

  const firmwareChecked = firmwareFields.length === allFirmwareKeys.length;
  const firmwareIndeterminate =
    firmwareFields.length > 0 && firmwareFields.length < allFirmwareKeys.length;

  const handleApiSectionToggle = (newEnabled) => {
    setApiEnabled(newEnabled);
    if (newEnabled) {
      if (apiFields.length === 0) {
        setApiFields(apiIntermediateFields);
      } else if (apiFields.length === allApiKeysWithHidden.length) {
        setApiFields(allApiKeysWithHidden);
      } else {
        setApiFields(allApiKeysWithHidden);
      }
    } else {
      setApiFields([]);
    }
  };

  const handleConfigSectionToggle = (newEnabled) => {
    setConfEnabled(newEnabled);
    if (newEnabled) {
      if (confFields.length === 0) {
        setConfFields(confIntermediateFields);
      } else if (confFields.length === allConfKeys.length) {
        setConfFields(allConfKeys);
      } else {
        setConfFields(allConfKeys);
      }
    } else {
      setConfFields([]);
    }
  };

  const handleFirmwareSectionToggle = (newEnabled) => {
    setFirmwareEnabled(newEnabled);
    if (newEnabled) {
      if (firmwareFields.length === 0) {
        setFirmwareFields(firmwareIntermediateFields);
      } else if (firmwareFields.length === allFirmwareKeys.length) {
        setFirmwareFields(allFirmwareKeys);
      } else {
        setFirmwareFields(allFirmwareKeys);
      }
    } else {
      setFirmwareFields([]);
    }
  };

  const handleApiFieldToggle = (key) => {
    setApiFields((prev) => {
      if (prev.includes(key)) {
        const newFields = prev.filter((k) => k !== key);
        if (key === 'url') {
          return newFields.filter((k) => k !== 'alive');
        } else if (key === 'url1') {
          return newFields.filter((k) => k !== 'alive1');
        } else if (key === 'url2') {
          return newFields.filter((k) => k !== 'alive2');
        }
        return newFields;
      } else {
        let newFields = [...prev, key];
        if (key === 'url') {
          newFields = [...newFields, 'alive'];
        } else if (key === 'url1') {
          newFields = [...newFields, 'alive1'];
        } else if (key === 'url2') {
          newFields = [...newFields, 'alive2'];
        }
        return newFields;
      }
    });
  };

  const handleConfigFieldToggle = (key) => {
    setConfFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleFirmwareFieldToggle = (key) => {
    setFirmwareFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center h-full"
      onClick={onClose}
    >
      <div
        className="bg-base-200 text-primary rounded-lg shadow-xl mt-4 mx-4 w-full max-w-2xl animate-slide-down h-[95%]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 h-full">
          <h3 className="font-bold text-lg">{t('tools.modal.title') || 'Настройка колонок'}</h3>

          <div className="py-4 flex gap-4 overflow-y-auto h-[90%]">
            {/* Секция API */}
            <div className="flex-1">
              <label className="flex items-center gap-2 mb-2">
                <Checkbox
                  color="info"
                  rounded="md"
                  checked={apiChecked}
                  indeterminate={apiIndeterminate}
                  onChange={(e) => handleApiSectionToggle(e.target.checked)}
                />
                <span className="font-bold">Def API</span>
              </label>

              <div className="pl-1 space-y-1">
                {apiFieldsList.map((f) => (
                  <label key={f.key} className="flex items-center gap-2">
                    <Checkbox
                      color="accent"
                      className="rounded-lg h-5 w-5"
                      rounded="md"
                      checked={apiFields.includes(f.key)}
                      onChange={() => handleApiFieldToggle(f.key)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Секция Config */}
            <div className="flex-1 border-x-2 border-base-100 h-full px-8">
              <label className="flex items-center gap-2 mb-2">
                <Checkbox
                  color="info"
                  rounded="md"
                  checked={confChecked}
                  indeterminate={confIndeterminate}
                  onChange={(e) => handleConfigSectionToggle(e.target.checked)}
                />
                <span className="font-bold">Config</span>
              </label>

              <div className="pl-1 space-y-1">
                {otherConfFields.map((f) => (
                  <label key={f.key} className="flex items-center gap-2">
                    <Checkbox
                      color="accent"
                      className="h-5 w-5"
                      rounded="md"
                      checked={confFields.includes(f.key)}
                      onChange={() => handleConfigFieldToggle(f.key)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}

                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      color="accent"
                      className="h-5 w-5"
                      rounded="md"
                      checked={scheduleDaysChecked}
                      indeterminate={scheduleDaysIndeterminate}
                      onChange={(e) => handleScheduleDaysToggle(e.target.checked)}
                    />
                    <span>Schedule Days</span>
                  </label>
                </div>

                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      color="accent"
                      className="h-5 w-5"
                      rounded="md"
                      checked={scheduleTimeChecked}
                      indeterminate={scheduleTimeIndeterminate}
                      onChange={(e) => handleScheduleTimeToggle(e.target.checked)}
                    />
                    <span>Schedule Time</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Секция Firmware */}
            <div className="flex-1">
              <label className="flex items-center gap-2 mb-2">
                <Checkbox
                  color="info"
                  rounded="md"
                  checked={firmwareChecked}
                  indeterminate={firmwareIndeterminate}
                  onChange={(e) => handleFirmwareSectionToggle(e.target.checked)}
                />
                <span className="font-bold">Firmware</span>
              </label>

              <div className="pl-1 space-y-1">
                {[...serialNumberList, ...firmwareList].map((f) => (
                  <label key={f.key} className="flex items-center gap-2">
                    <Checkbox
                      color="accent"
                      rounded="md"
                      className="h-5 w-5"
                      checked={firmwareFields.includes(f.key)}
                      onChange={() => handleFirmwareFieldToggle(f.key)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-action mt-4">
            <button
              className="btn btn-primary border-btn bg-info border-info hover:bg-base-100 hover:border-primary"
              onClick={onClose}
            >
              {t('tools.modal.close') || 'Закрыть'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnsModal;

