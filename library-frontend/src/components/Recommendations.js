import { useQuery } from '@apollo/client'
import { GET_BOOKS_BY_GENRE } from '../queries'

const Recommendations = (props) => {
  const genre = props.favourite
  const booksResult = useQuery(GET_BOOKS_BY_GENRE, {
    variables: { genre },
  })

  if (booksResult.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const booksByGenre = booksResult.data.booksByGenre

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        in your favourite genre <b>{genre}</b>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksByGenre.map((a) => (
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

export default Recommendations
