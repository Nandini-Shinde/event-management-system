const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const format = (value, options) => {
  return new Date(value).toLocaleDateString('en-IN', options);
};

export const formatEventDateRange = (
  startDate,
  endDate,
  { long = false, weekday = false } = {}
) => {
  if (!startDate || !isValidDate(startDate)) {
    return 'Date TBA';
  }

  const start = new Date(startDate);
  const end = endDate && isValidDate(endDate)
    ? new Date(endDate)
    : null;

  const isMultiDay = end && end.getTime() > start.getTime();

  if (!isMultiDay) {
    return format(start, {
      ...(weekday ? { weekday: long ? 'long' : 'short' } : {}),
      day: 'numeric',
      month: long ? 'long' : 'short',
      year: 'numeric'
    });
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (weekday) {
    const startText = format(start, {
      weekday: long ? 'long' : 'short',
      day: 'numeric',
      month: long ? 'long' : 'short',
      year: 'numeric'
    });

    const endText = format(end, {
      weekday: long ? 'long' : 'short',
      day: 'numeric',
      month: long ? 'long' : 'short',
      year: 'numeric'
    });

    if (sameYear) {
      const withoutYear = (text) => text.replace(/,?\s*\d{4}$/, '');
      return `${withoutYear(startText)} – ${endText}`;
    }

    return `${startText} – ${endText}`;
  }

  if (sameMonth) {
    const month = format(start, {
      month: long ? 'long' : 'short'
    });

    return `${start.getDate()}–${end.getDate()} ${month} ${start.getFullYear()}`;
  }

  const startText = format(start, {
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: 'numeric'
  });

  const endText = format(end, {
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: 'numeric'
  });

  if (sameYear) {
    const withoutYear = startText.replace(/,?\s*\d{4}$/, '');
    return `${withoutYear} – ${endText}`;
  }

  return `${startText} – ${endText}`;
};
