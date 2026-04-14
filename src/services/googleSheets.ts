import Papa from "papaparse";
import { Wine, WineType } from "../types";

export async function fetchGoogleSheetData(input: string): Promise<Wine[]> {
  // Extract ID if a full URL is provided
  let sheetId = input;
  const urlMatch = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    sheetId = urlMatch[1];
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  
  try {
    console.log("Fetching from URL:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("시트를 찾을 수 없습니다. ID가 정확한지 확인해주세요.");
      }
      throw new Error("스프레드시트 접근에 실패했습니다. '링크가 있는 모든 사용자에게 공개' 상태인지 다시 한번 확인해주세요.");
    }
    
    const csvText = await response.text();
    
    // Check if the response is actually HTML (which happens when access is denied)
    if (csvText.trim().startsWith("<!DOCTYPE html>") || csvText.includes("google-signin")) {
      throw new Error("접근 권한 오류: 시트가 '공개' 상태가 아니거나 로그인 페이지로 리다이렉트되었습니다. 공유 설정을 확인해주세요.");
    }
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mappedData: Wine[] = results.data.map((row: any, index: number) => ({
            id: `sheet-${index}`,
            name: row["와인명"] || row["Name"] || "Unknown",
            producer: row["생산자"] || row["Producer"] || "",
            region: row["지역"] || row["Region"] || "",
            country: row["국가"] || row["Country"] || "",
            type: (row["종류"] || row["Type"] || "Red") as WineType,
            vintage: String(row["빈티지"] || row["Vintage"] || ""),
            quantity: Number(row["수량"] || row["Quantity"] || 0),
            price: Number(row["단가"] || row["Price"] || 0),
            location: row["위치"] || row["Location"] || "",
            status: (row["상태"] || row["Status"] || "Optimal") as any,
            importDate: row["입고일"] || row["ImportDate"] || new Date().toISOString().split('T')[0],
          }));
          resolve(mappedData);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Google Sheets Fetch Error:", error);
    throw error;
  }
}
