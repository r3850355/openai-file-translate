import fs from 'fs'
import path from 'path'
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import translate from './axios.js'

const directoryPath = './input'

const parser = new XMLParser()
const builder = new XMLBuilder({
  format: true
})

function scanDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directoryPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error stating file:', err);
          return;
        }

        if (stats.isDirectory()) {
          scanDirectory(filePath);
        } else if (stats.isFile()) {
          console.log(`[檔案讀取] =>  ${filePath}`)
          fileProcess(filePath)
        }
      });
    });
  });
}

function fileProcess (filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    // 將讀入的XML轉為 json object
    const payload = parser.parse(data)
    const pending = []
  
    /**
     * 歷遍所有 LanguageData 下的物件並翻譯
     */
    for (let item in payload.LanguageData) {
      console.log(`[翻譯] =>  ${item}`)
      pending.push(translate(payload.LanguageData[item]).then(text => {
        payload.LanguageData[item] = text
      }))
      // pending.push(payload.LanguageData[item] = 'test')
    }
  
    /**
     * 完成後寫入檔案
     */

    Promise.all(pending).then(() => {
      const xml = builder.build(payload)
      filePath = filePath.replace('input', 'output')
      const dirpath = path.dirname(filePath)
      console.log(dirpath)
      if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath, { recursive: true });
      fs.writeFile(filePath, xml, 'utf8', err => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
      
        console.log(`[檔案寫入] => ${filePath}`);
      })
    })
  });
}



scanDirectory(directoryPath);