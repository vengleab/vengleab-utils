const MONTH_MAP = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
};

const WEEK_MAP = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
};

function formatOrdinal(num) {
  const n = parseInt(num, 10);
  const suffix = ['th', 'st', 'nd', 'rd'][(n % 10 > 3 || Math.floor(n % 100 / 10) === 1) ? 0 : n % 10];
  return n + suffix;
}

function formatHour(h) {
  const hr = parseInt(h, 10);
  if (hr === 0) return '12 AM';
  if (hr === 12) return '12 PM';
  if (hr > 12) return (hr - 12) + ' PM';
  return hr + ' AM';
}

function formatMonth(m) {
  const idx = parseInt(m, 10) - 1;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[idx] || m;
}

function formatDayOfWeek(d) {
  const idx = parseInt(d, 10);
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  return days[idx] || d;
}

function expandField(fieldStr, min, max, nameMap = null) {
  const allowed = new Set();
  
  let cleanStr = fieldStr.toUpperCase().trim();
  if (nameMap) {
    for (const [name, val] of Object.entries(nameMap)) {
      cleanStr = cleanStr.replaceAll(name, val);
    }
  }

  const parts = cleanStr.split(',');
  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) allowed.add(i);
    } else if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) throw new Error(`Invalid step value: "${stepStr}"`);
      
      let rangeMin = min;
      let rangeMax = max;
      
      if (range !== '*') {
        if (range.includes('-')) {
          const [rMin, rMax] = range.split('-');
          rangeMin = parseInt(rMin, 10);
          rangeMax = parseInt(rMax, 10);
        } else {
          rangeMin = parseInt(range, 10);
        }
      }
      
      if (isNaN(rangeMin) || isNaN(rangeMax) || rangeMin < min || rangeMax > max || rangeMin > rangeMax) {
        throw new Error(`Invalid range for step in value: "${part}"`);
      }
      
      for (let i = rangeMin; i <= rangeMax; i += step) {
        allowed.add(i);
      }
    } else if (part.includes('-')) {
      const [rMin, rMax] = part.split('-');
      const rangeMin = parseInt(rMin, 10);
      const rangeMax = parseInt(rMax, 10);
      if (isNaN(rangeMin) || isNaN(rangeMax) || rangeMin < min || rangeMax > max || rangeMin > rangeMax) {
        throw new Error(`Invalid range: "${part}"`);
      }
      for (let i = rangeMin; i <= rangeMax; i++) {
        allowed.add(i);
      }
    } else {
      const val = parseInt(part, 10);
      if (isNaN(val) || val < min || val > max) {
        throw new Error(`Invalid value: "${part}" (must be between ${min} and ${max})`);
      }
      allowed.add(val);
    }
  }
  return allowed;
}

function explainField(fieldStr, unitSingular, unitPlural, formatVal = (v) => v) {
  if (fieldStr === '*') return `every ${unitSingular}`;
  
  const terms = fieldStr.split(',').map(term => {
    if (term === '*') return `every ${unitSingular}`;
    if (term.includes('/')) {
      const [range, step] = term.split('/');
      const stepText = `every ${step} ${unitPlural}`;
      if (range === '*') return stepText;
      if (range.includes('-')) {
        const [rMin, rMax] = range.split('-');
        return `${stepText} from ${formatVal(rMin)} through ${formatVal(rMax)}`;
      }
      return `${stepText} starting from ${formatVal(range)}`;
    }
    if (term.includes('-')) {
      const [rMin, rMax] = term.split('-');
      return `from ${formatVal(rMin)} through ${formatVal(rMax)}`;
    }
    return `at ${formatVal(term)}`;
  });

  if (terms.length === 1) return terms[0];
  if (terms.length === 2) return `${terms[0]} and ${terms[1]}`;
  return `${terms.slice(0, -1).join(', ')}, and ${terms[terms.length - 1]}`;
}

export function parseCron(expression) {
  try {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return {
        isValid: false,
        error: 'Cron expression must contain exactly 5 space-separated fields (minute, hour, day of month, month, day of week).'
      };
    }

    const minutes = expandField(parts[0], 0, 59);
    const hours = expandField(parts[1], 0, 23);
    const daysOfMonth = expandField(parts[2], 1, 31);
    const months = expandField(parts[3], 1, 12, MONTH_MAP);
    const daysOfWeek = expandField(parts[4], 0, 7, WEEK_MAP); // 0 or 7 is Sunday

    // Map 7 to 0 (Sunday) if present
    if (daysOfWeek.has(7)) {
      daysOfWeek.delete(7);
      daysOfWeek.add(0);
    }

    const cronSets = {
      minutes,
      hours,
      daysOfMonth,
      months,
      daysOfWeek,
      isDomAsterisk: parts[2] === '*',
      isDowAsterisk: parts[4] === '*'
    };

    // Construct human-readable explanations
    const minuteDesc = explainField(parts[0], 'minute', 'minutes');
    const hourDesc = explainField(parts[1], 'hour', 'hours', formatHour);
    const domDesc = explainField(parts[2], 'day of month', 'days of month', formatOrdinal);
    const monthDesc = explainField(parts[3], 'month', 'months', formatMonth);
    const dowDesc = explainField(parts[4], 'day of week', 'days of week', formatDayOfWeek);

    let summary = '';
    if (parts[0] === '*' && parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      summary = 'Every minute.';
    } else {
      const sentenceParts = [];
      sentenceParts.push(minuteDesc.charAt(0).toUpperCase() + minuteDesc.slice(1));
      if (parts[1] !== '*') sentenceParts.push(hourDesc);
      if (parts[2] !== '*') sentenceParts.push(domDesc);
      if (parts[3] !== '*') sentenceParts.push(`in ${monthDesc}`);
      if (parts[4] !== '*') sentenceParts.push(`on ${dowDesc}`);
      summary = sentenceParts.join(', ') + '.';
    }

    // Generate next run dates
    const nextRuns = getNextRuns(cronSets, 5);

    return {
      isValid: true,
      explanation: {
        summary,
        fields: {
          minute: minuteDesc,
          hour: hourDesc,
          dayOfMonth: domDesc,
          month: monthDesc,
          dayOfWeek: dowDesc
        }
      },
      nextRuns
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message
    };
  }
}

function getNextRuns(cronSets, count = 5, startDate = new Date()) {
  const { minutes, hours, daysOfMonth, months, daysOfWeek, isDomAsterisk, isDowAsterisk } = cronSets;
  const nextRuns = [];
  
  let current = new Date(startDate.getTime());
  current.setSeconds(0);
  current.setMilliseconds(0);
  
  // Start from next minute
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  const maxIterations = 50000; // Safeguard

  while (nextRuns.length < count && iterations < maxIterations) {
    iterations++;

    const m = current.getMonth() + 1; // getMonth is 0-11
    if (!months.has(m)) {
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const d = current.getDate();
    const dw = current.getDay(); // 0 is Sunday, 6 is Saturday

    // Cron DOW/DOM rule: if both are restricted, match either. Otherwise match both.
    const domRestricted = !isDomAsterisk;
    const dowRestricted = !isDowAsterisk;
    
    let dateMatch = false;
    if (domRestricted && dowRestricted) {
      dateMatch = daysOfMonth.has(d) || daysOfWeek.has(dw);
    } else {
      dateMatch = daysOfMonth.has(d) && daysOfWeek.has(dw);
    }

    if (!dateMatch) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const h = current.getHours();
    if (!hours.has(h)) {
      current.setHours(current.getHours() + 1);
      current.setMinutes(0, 0, 0);
      continue;
    }

    const min = current.getMinutes();
    if (!minutes.has(min)) {
      current.setMinutes(current.getMinutes() + 1);
      continue;
    }

    // Success!
    nextRuns.push(new Date(current.getTime()));
    current.setMinutes(current.getMinutes() + 1);
  }

  return nextRuns;
}
