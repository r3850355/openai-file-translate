import axios from "axios" 
import dotenv from 'dotenv'
dotenv.config()


const client = axios.create({
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY
  }
})
const prompt = "將以下的內容翻譯成科幻遊戲中的詞彙，並翻成繁體中文，僅返回翻譯後的內容:"


function translate (data) {
  return new Promise((resolve, reject) => {

    const params = {
      model: 'text-davinci-003',
      prompt: prompt + data,
      temperature: 0.6,
      max_tokens: 1024
    }

    client.post('https://api.openai.com/v1/completions', params).then(res => {
      const result = res.data.choices[0].text
      console.log(JSON.stringify(result))
      resolve(result.replace(/(\r\n|\n|\r)/gm, ''))
    }).catch(err => {
      reject(err)
    })
    
  })
}

export default translate
