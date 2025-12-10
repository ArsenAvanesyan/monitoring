//? Функция для форматирования hex в читаемый вид (с переносами строк)
function formatHex(hexString, bytesPerLine = 16) {
  const bytes = hexString.split(' ');
  let result = '';
  for (let i = 0; i < bytes.length; i += bytesPerLine) {
    const line = bytes.slice(i, i + bytesPerLine);
    const offset = i.toString(16).padStart(8, '0');
    const hex = line.join(' ');
    const ascii = line
      .map((b) => {
        const charCode = parseInt(b, 16);
        return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
      })
      .join('');
    result += `${offset}:  ${hex.padEnd(48)}  ${ascii}\n`;
  }
  return result;
}

module.exports = formatHex;
