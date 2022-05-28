import { DateType, ScheduleType, ScheduleFilterType, ArgsType } from 'types';

export const isArgsType = (arg: any): arg is ArgsType => arg;

export const getToday = () => {
  const today = new Date(Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return {
    year,
    month,
    day,
  };
};

export const getFirstOrEndDay = (
  year: number,
  month: number,
  day: number
): {
  type?: 'firstMonth' | 'firstDay' | 'lastMonth' | 'lastDay';
  year: number;
  month: number;
  day: number;
} => {
  const FIRST_DAY = 1;
  const FIRST_MONTH = 1;
  const LAST_DAY = new Date(year, month, 0).getDate();
  const LAST_MONTH = 12;
  const PEAK = 1;

  /** 月初 */
  if (FIRST_DAY === day) {
    /** 年初 */
    if (FIRST_MONTH === month) {
      return {
        type: 'firstMonth',
        year: year - 1,
        month: LAST_MONTH,
        day: new Date(year - 1, LAST_MONTH, 0).getDate(),
      };
    }

    return {
      type: 'firstDay',
      year,
      month: month - 1,
      day: new Date(year, month - 1, 0).getDate(),
    };
  }

  /** 月末 */
  if (Math.abs(LAST_DAY - day) <= PEAK) {
    /** 年末 */
    if (LAST_MONTH === month) {
      return {
        type: 'lastMonth',
        year: year + 1,
        month: FIRST_MONTH,
        day: FIRST_DAY,
      };
    }

    return {
      type: 'lastDay',
      year,
      month: month + 1,
      day: FIRST_DAY,
    };
  }

  return {
    type: undefined,
    year,
    month,
    day,
  };
};

export const convertText = (text: string) => text.trim().replace(/\n|\s+/g, '');

export const convertTime = (time: string) => {
  const matchText = time.match(/([0-9]|1[0-9]|2[0-9])(:|：)[0-5][0-9]/g);
  return matchText ? matchText.map((item) => `0${item}`.slice(-5).replace(/：/g, ':')) : undefined;
};

export const sliceBrackets = (text: string) =>
  text.slice(0, 1) === '「' && text.slice(-1) === '」' ? text.slice(1, text.length - 1) : text;

export const convertOver24Time = (date: DateType[]) => {
  for (let i = 0; i < date.length; i++) {
    const overTimeSchedule = date[i].schedule
      .filter((item: ScheduleType): item is ScheduleFilterType =>
        Boolean(item.startTime && Number(item.startTime.split(':')[0]) >= 24)
      )
      .map((item) => {
        const startTime = item.startTime?.split(':');
        const endTime = item.endTime?.split(':');

        return {
          ...item,
          startTime: `0${Number(startTime[0]) - 24}:${startTime[1]}`.slice(-5),
          endTime: endTime ? `0${Number(endTime[0]) - 24}:${endTime[1]}`.slice(-5) : undefined,
        };
      });

    for (let j = 0; j < overTimeSchedule.length; j++) {
      date[i].schedule = date[i].schedule.filter((item) => item.text !== overTimeSchedule[j].text);
    }

    if (i + 1 < date.length) {
      date[i + 1].schedule = [...date[i + 1].schedule, ...overTimeSchedule];
    }
  }

  return date;
};

export const convertHalfToFull = (value: string) => {
  const textMap: { [key: string]: string } = {
    ｶﾞ: 'ガ',
    ｷﾞ: 'ギ',
    ｸﾞ: 'グ',
    ｹﾞ: 'ゲ',
    ｺﾞ: 'ゴ',
    ｻﾞ: 'ザ',
    ｼﾞ: 'ジ',
    ｽﾞ: 'ズ',
    ｾﾞ: 'ゼ',
    ｿﾞ: 'ゾ',
    ﾀﾞ: 'ダ',
    ﾁﾞ: 'ヂ',
    ﾂﾞ: 'ヅ',
    ﾃﾞ: 'デ',
    ﾄﾞ: 'ド',
    ﾊﾞ: 'バ',
    ﾋﾞ: 'ビ',
    ﾌﾞ: 'ブ',
    ﾍﾞ: 'ベ',
    ﾎﾞ: 'ボ',
    ﾊﾟ: 'パ',
    ﾋﾟ: 'ピ',
    ﾌﾟ: 'プ',
    ﾍﾟ: 'ペ',
    ﾎﾟ: 'ポ',
    ｳﾞ: 'ヴ',
    ﾜﾞ: 'ヷ',
    ｦﾞ: 'ヺ',
    ｱ: 'ア',
    ｲ: 'イ',
    ｳ: 'ウ',
    ｴ: 'エ',
    ｵ: 'オ',
    ｶ: 'カ',
    ｷ: 'キ',
    ｸ: 'ク',
    ｹ: 'ケ',
    ｺ: 'コ',
    ｻ: 'サ',
    ｼ: 'シ',
    ｽ: 'ス',
    ｾ: 'セ',
    ｿ: 'ソ',
    ﾀ: 'タ',
    ﾁ: 'チ',
    ﾂ: 'ツ',
    ﾃ: 'テ',
    ﾄ: 'ト',
    ﾅ: 'ナ',
    ﾆ: 'ニ',
    ﾇ: 'ヌ',
    ﾈ: 'ネ',
    ﾉ: 'ノ',
    ﾊ: 'ハ',
    ﾋ: 'ヒ',
    ﾌ: 'フ',
    ﾍ: 'ヘ',
    ﾎ: 'ホ',
    ﾏ: 'マ',
    ﾐ: 'ミ',
    ﾑ: 'ム',
    ﾒ: 'メ',
    ﾓ: 'モ',
    ﾔ: 'ヤ',
    ﾕ: 'ユ',
    ﾖ: 'ヨ',
    ﾗ: 'ラ',
    ﾘ: 'リ',
    ﾙ: 'ル',
    ﾚ: 'レ',
    ﾛ: 'ロ',
    ﾜ: 'ワ',
    ｦ: 'ヲ',
    ﾝ: 'ン',
    ｧ: 'ァ',
    ｨ: 'ィ',
    ｩ: 'ゥ',
    ｪ: 'ェ',
    ｫ: 'ォ',
    ｯ: 'ッ',
    ｬ: 'ャ',
    ｭ: 'ュ',
    ｮ: 'ョ',
    '｡': '。',
    '､': '、',
    ｰ: 'ー',
    '｢': '「',
    '｣': '」',
    '･': '・',
  };

  const reg = new RegExp(`(${Object.keys(textMap).join('|')})`, 'g');
  return value
    .replace(reg, (s) => textMap[s])
    .replace(/ﾞ/g, '゛')
    .replace(/ﾟ/g, '゜');
};
