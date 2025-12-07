//? Ключи для Redis
const REDIS_KEYS = {
  LAST_DATA: 'access:lastData',
  DATA_ARRAY: 'access:dataArray',
  TIMESTAMP: 'access:timestamp',
  HEX_DATA: 'access:hexData',
  COUNTER_RECEIVE: 'access:counters:receive',
  COUNTER_GET: 'access:counters:get',
};

//? Максимальное количество объектов в истории (для ограничения размера списка)
const MAX_HISTORY_SIZE = 1000;

module.exports = { REDIS_KEYS, MAX_HISTORY_SIZE };
