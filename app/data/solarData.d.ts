declare module '../solarData.json' {
  const data: Array<{
    timestamp: string;
    ALLSKY_SFC_SW_DWN: number;
  }>;
  export default data;
} 