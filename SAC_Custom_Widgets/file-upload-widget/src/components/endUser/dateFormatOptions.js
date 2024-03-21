const WeekSourceFormats = ["YYYYWW", "YYYY/WW", "YYYY-WW", "YYYY.WW", "WWYYYY", "WW-YYYY", "WW/YYYY", "WW.YYYY"];
const DaySourceFormats = ["YYYYMMDD", "YYYY/MM-DD", "YYYY-MM/DD", "YYYY-DD-MM", "YYYY-MM-DD", "YYYY/MM/DD", "DD-MM-YYYY", "DD.MM.YYYY", "DD/MM/YYYY", "MM-DD-YYYY"];
const QuarterSourceFormats = ["YYYYQ", "YYYY-Q", "YYYYQQ", "YYYY-QQ", "YYYY.QQ"];
const MonthSourceFormats = ["YYYYMM", "YYYY/MM", "YYYY-MM", "YYYY.MM", "MMYYYY", "MM-YYYY", "MM/YYYY", "MM.YYYY"];
const YearSourceFormats = ["YYYY"]
const FiscalSourceFormats = ["YYYYPP", "YYYY.PP", "PPPYYYY", "YYYY-PP", "PPP.YYYY", "PPP/YYYY", "PPP-YYYY", "YYYY.PPP", "YYYYPPP"];
const FiscalDaySourceFormats = ["YYYYPPDD", "YYYY/PP-DD", "YYYY-PP/DD", "YYYY-DD-PP", "YYYY-PP-DD", "YYYY/PP/DD", "DD-PP-YYYY", "DD.PP.YYYY", "DD/PP/YYYY", "PP-DD-YYYY"];


const DATE_FORMATS = [
    ...WeekSourceFormats, ...DaySourceFormats, ...QuarterSourceFormats, ...MonthSourceFormats, ...YearSourceFormats, ...FiscalSourceFormats, ...FiscalDaySourceFormats
]

export default DATE_FORMATS