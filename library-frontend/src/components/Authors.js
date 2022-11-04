import { useMutation, useQuery } from '@apollo/client'
import { All_AUTHORS, SET_BORN } from '../queries'
import Select from 'react-select'
import { useState } from 'react'

const Authors = (props) => {
  const result = useQuery(All_AUTHORS)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [tempBorn, setTempBorn] = useState('')
  const token = props.token

  const [editAuthor] = useMutation(SET_BORN, {
    refetchQueries: [{ query: All_AUTHORS }],
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const authors = result.data.allAuthors

  const options = authors.map((a) => {
    return {
      value: a,
      label: a.name,
    }
  })

  const setBirthYear = (event) => {
    event.preventDefault()
    const setBornTo = parseInt(tempBorn)
    const name = selectedOpt.name

    editAuthor({ variables: { name, setBornTo, token } })

    setTempBorn('')
    setSelectedOpt({})
  }

  const handleChange = (event) => {
    setTempBorn(event.target.value)
  }

  const handleSelected = (event) => {
    setSelectedOpt(event.value)
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token && (
        <div>
          <h2>set birthyear</h2>
          <form onSubmit={setBirthYear}>
            <Select
              defaultValue={selectedOpt}
              onChange={handleSelected}
              options={options}
            />
            <input type="number" value={tempBorn} onChange={handleChange} />
            <button type="submit">edit author</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Authors
