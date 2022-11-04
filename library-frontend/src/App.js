import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { GET_USER, BOOK_ADDED, ALL_BOOKS } from './queries'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'

//helper function
export const updateCache = (cache, query, addedBook) => {
  const uniqueByName = (b) => {
    let seen = new Set()
    return b.filter((item) => {
      let t = item.title
      return seen.has(t) ? false : seen.add(t)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqueByName(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  const client = useApolloClient()

  const { loading, error, data, refetch } = useQuery(GET_USER, {
    variables: { token },
  })

  const showWhenLoggedIn = {
    display: token ? '' : 'none',
  }
  const hideWhenLoggedIn = {
    display: token ? 'none' : '',
  }

  // window.localStorage.clear()

  useEffect(() => {
    const userToken = window.localStorage.getItem('library-user-token')
    if (userToken) {
      setToken(userToken)
    }
    if (token) {
      refetch().then((res) => setUser(res.data.me))
    }
  }, [token, data]) //eslint-disable-line

  useSubscription(BOOK_ADDED, {
    fetchPolicy: 'network-only',
    onData: ({ sData }) => {
      console.log('I did get something')
      const addedBook = sData.data.bookAdded
      console.log(addedBook)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
      return window.alert(`new book ${addedBook.title} added`)
    },
  })

  const logout = () => {
    setToken(null)
    window.localStorage.removeItem('library-user-token')
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        <button style={showWhenLoggedIn} onClick={() => setPage('add')}>
          add book
        </button>
        <button
          style={showWhenLoggedIn}
          onClick={() => setPage('recommendations')}
        >
          recommendations
        </button>
        <button style={showWhenLoggedIn} onClick={() => logout()}>
          log out
        </button>

        <button style={hideWhenLoggedIn} onClick={() => setPage('login')}>
          log in
        </button>
      </div>

      {!token && (
        <LoginForm
          show={page === 'login'}
          setToken={setToken}
          setPage={setPage}
        />
      )}

      <Authors show={page === 'authors'} token={token} />
      <Books show={page === 'books'} />
      {user && (
        <Recommendations
          show={page === 'recommendations'}
          favourite={user.favouriteGenre}
        />
      )}
      {user && <NewBook show={page === 'add'} token={token} />}
    </div>
  )
}

export default App
