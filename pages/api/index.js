import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import axios from 'axios'
import nodeHtmlToImage from 'node-html-to-image'

const ajv = new Ajv()
addFormats(ajv)

const schema = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' }
  },
  required: ['url']
}

export default async function index(req, res) {
  // Validasi query
  const valid = ajv.validate(schema, req.query)
  if (!valid) {
    res.status(403).send(ajv.errors.map(({ message }) => message))
    return
  } else {
    const { url } = req.query

    await axios(url)
      .then(async ({ data }) => {
        const html = data
        const image = await nodeHtmlToImage({
          html
        })

        res.writeHead(200, { 'Content-Type': 'image/png' })
        res.end(image, 'binary')
      })
      .catch((error) => {
        res.status(500).json(error)
      })
  }
}
