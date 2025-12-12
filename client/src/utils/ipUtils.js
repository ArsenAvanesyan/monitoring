// Утилита для сравнения IP адресов
export const compareIp = (ip1, ip2) => {
  if (!ip1 || !ip2) return 0;

  const parts1 = ip1.split('.').map(Number);
  const parts2 = ip2.split('.').map(Number);

  for (let i = 0; i < 4; i++) {
    const diff = (parts1[i] || 0) - (parts2[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

