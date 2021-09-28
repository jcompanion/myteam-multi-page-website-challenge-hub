require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req
  })
}

// Link Resolver
const linkResolver = doc => {
  // Define the url depending on the document type
  // if (doc.type === 'page') {
  //   return '/page/' + doc.uid
  // } else if (doc.type === 'blog_post') {
  //   return '/blog/' + doc.uid
  // }

  // Default to homepage
  return '/'
}

// Middleware to inject prismic context
app.use(function (req, res, next) {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: linkResolver
  }
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  initApi(req).then((api) => {
    api.query(
      Prismic.Predicates.any('document.type', ['home', 'meta'])
    ).then((response) => {
      const { results } = response
      const [meta, home] = results
      console.log(meta, home)
      // response is the response object. Render your views here.
      res.render('pages/home', {
        home,
        meta
      })
    })
  })
})

app.get('/about', (req, res) => {
  res.render('pages/about')
})

app.get('/collections/', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:id', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`_Blank app listening at http://localhost:${port}`)
})
