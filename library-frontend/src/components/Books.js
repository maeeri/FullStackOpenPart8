import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES, GET_BOOKS_BY_GENRE } from '../queries'
import { useEffect, useState } from 'react'

const Books = (props) => {
  const [books, setBooks] = useState([])
  const [genre, setGenre] = useState('all')
  const booksResult = useQuery(ALL_BOOKS)
  const genresResult = useQuery(ALL_GENRES)

  const { loading, error, data, refetch } = useQuery(GET_BOOKS_BY_GENRE, {
    variables: { genre },
  })

  useEffect(() => {
    if (booksResult.data && genre === 'all') {
      setBooks(booksResult.data.allBooks)
    } else if (genre !== 'all') {
      refetch().then((result) => setBooks(result.data.booksByGenre))
    }
  }, [genre, booksResult.data]) //eslint-disable-line

  if (booksResult.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const booksToShow = [...books]
  const genres = Object.values(genresResult.data.allGenres)
  genres.push('all')

  return (
    <div>
      <h2>books</h2>
      {booksResult.loading && <div> loading...</div>}
      {genres.map((g) => (
        <button key={g} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
