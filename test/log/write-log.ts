import * as fs from 'fs';


/** Archivo donde se escribirá la salida. */
export const logFilePath = 'results/ws-user.ts';

/** Escribe en el archivo `logFilePath`. */
export const writeLog = (variable: string, data: any) => {
  const url = `./test/${logFilePath}`;
  const value = JSON.stringify(data, null, ' ');
  console.log(value);
  fs.appendFileSync(url, `const ${variable} = ${value};\n\n`);
}