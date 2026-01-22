(() => {
  /**
   * Формат для денег: пробелы между тысячами, десятичная часть (если есть) сохраняется как введена.
   * Пример: "8500000" -> "8 500 000", "1234.5" -> "1 234.5"
   */
  function formatMoneyInputValue(rawValue) {
    const value = String(rawValue ?? "")
      .replace(/\s+/g, "")
      .replace(/,/g, ".")
      .replace(/[^\d.]/g, "");

    if (!value) return "";

    const firstDot = value.indexOf(".");
    const intPart = firstDot === -1 ? value : value.slice(0, firstDot);
    const fracPart = firstDot === -1 ? "" : value.slice(firstDot + 1).replace(/\./g, "");

    // Убираем ведущие нули, но оставляем один ноль если всё нули
    const intNormalized = intPart.replace(/^0+(?=\d)/, "");
    const intSpaced = intNormalized.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return fracPart.length ? `${intSpaced}.${fracPart}` : intSpaced;
  }

  function countDigitsBeforeCursor(str, cursorIndex) {
    let count = 0;
    for (let i = 0; i < Math.min(cursorIndex, str.length); i += 1) {
      if (/\d/.test(str[i])) count += 1;
    }
    return count;
  }

  function findCursorIndexAfterDigits(str, digitsCount) {
    if (digitsCount <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < str.length; i += 1) {
      if (/\d/.test(str[i])) seen += 1;
      if (seen >= digitsCount) return i + 1;
    }
    return str.length;
  }

  function attachMoneyFormatter(input) {
    const handler = () => {
      const before = input.value;
      const selectionStart = input.selectionStart ?? before.length;
      const digitsBefore = countDigitsBeforeCursor(before, selectionStart);

      const after = formatMoneyInputValue(before);
      if (after === before) return;

      input.value = after;

      const nextCursor = findCursorIndexAfterDigits(after, digitsBefore);
      try {
        input.setSelectionRange(nextCursor, nextCursor);
      } catch {
        // ignore (например, если элемент не в фокусе)
      }
    };

    input.addEventListener("input", handler);
    input.addEventListener("blur", handler);

    // Форматируем сразу, если значение уже проставлено сервером
    handler();
  }

  window.addEventListener("DOMContentLoaded", () => {
    const homePrice = document.querySelector('input[name="home_price"]');
    const downPayment = document.querySelector('input[name="down_payment"]');

    if (homePrice) attachMoneyFormatter(homePrice);
    if (downPayment) attachMoneyFormatter(downPayment);
  });
})();

