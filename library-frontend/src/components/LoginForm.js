import { useState, useEffect } from 'react'
import { LOGIN } from '../queries'
import { useMutation } from '@apollo/client'

const LoginForm = ({ setError, setToken, setPage, show }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
    }
  }, [result.data]) //eslint-disable-line

  if (!show) {
    return null
  }

  const submitLogin = (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
    setPage('authors')
    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <br />
      <br />
      <form onSubmit={submitLogin}>
        <label>username</label>
        <input
          onChange={({ target }) => setUsername(target.value)}
          type="text"
          value={username}
        />
        <br />
        <label>password</label>
        <input
          onChange={({ target }) => setPassword(target.value)}
          type="password"
          value={password}
        />
        <br />
        <button type="submit">log in</button>
      </form>
    </div>
  )
}

export default LoginForm
