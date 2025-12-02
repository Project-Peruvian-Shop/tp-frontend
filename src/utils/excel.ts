import * as XLSX from "xlsx";

/**
 * Función genérica para descargar datos en formato Excel
 * @param data - Array de objetos a exportar
 * @param fileName - Nombre del archivo (sin extensión)
 * @param sheetName - Nombre de la hoja de Excel
 */
export const downloadExcel = <T extends Record<string, unknown>>(
  data: T[],
  fileName: string,
  sheetName: string = "Datos"
): void => {
  try {
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Convertir los datos a una hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
    throw new Error("No se pudo generar el archivo Excel");
  }
};
