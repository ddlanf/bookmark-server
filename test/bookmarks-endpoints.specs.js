const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmarks Endpoints', function() {
    let db
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('bookmarks').truncate())
  
    afterEach('cleanup', () => db('bookmarks').truncate())

    describe(`GET /bookmarks`, () => {

        context(`Given no Bookmarks`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                  .get('/bookmarks')
                  .expect(200, [])
            })
        })
        
        context('Given there are Bookmarks in the database', () => {
          const testBookmarks = makeBookmarksArray()
    
          beforeEach('insert Bookmarks', () => {
            return db
              .into('bookmarks')
              .insert(testBookmarks)
          })
    
          it('responds with 200 and all of the Bookmarks', () => {
            return supertest(app)
              .get('/bookmarks')
              .expect(200, testBookmarks)
          })
        })
    })

    describe(`GET /bookmarks/:bookmark_id`, () => {

      context(`Given no Bookmarks`, () => {
              it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                  .get(`/bookmarks/${bookmarkId}`)
                  .expect(404, { error: { message: `bookmark doesn't exist` } })
              })
      })
      
      context('Given there are Bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()
  
        beforeEach('insert Bookmarks', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks)
        })
  
        it('responds with 200 and the specified bookmark', () => {
          const bookmarkId = 2
          const expectedBookmark = testBookmarks[bookmarkId - 1]
          return supertest(app)
            .get(`/bookmarks/${bookmarkId}`)
            .expect(200, expectedBookmark)
        })
      })
    })
})