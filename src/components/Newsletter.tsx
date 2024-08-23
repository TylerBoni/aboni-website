'use Client'

import { useState } from "react"

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 6" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 3 10 .5v2H0v1h10v2L16 3Z"
      />
    </svg>
  )
}

const NewsletterForm = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('')
    setSubmitted(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (email === '' || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    fetch('/api/form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: "{\"email\":\"" + email + "\",\"message\":\"NEWSLETTER SIGNUP\"}"
    }).then((res) => {
      if (res.ok) {
        setSubmitted(true)
        setError('')
      } else {
        console.error('Form submission failed')
        setError('Form submission failed, please try again later.')
      }
    })
  }
  return (
    <form className="max-w-sm" onSubmit={handleSubmit}>
      <h2 className="font-display text-sm font-semibold tracking-wider text-neutral-950">
        Sign up for our newsletter
      </h2>
      <p className="mt-4 text-sm text-neutral-700">
        Subscribe to get the latest design news, articles, resources and
        inspiration.
      </p>
      <div className="relative mt-6">
        <input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          aria-label="Email address"
          className="block w-full rounded-2xl border border-neutral-300 bg-transparent py-4 pl-6 pr-20 text-base/6 text-neutral-950 ring-4 ring-transparent transition placeholder:text-neutral-500 focus:border-neutral-950 focus:outline-none focus:ring-neutral-950/5"
          onChange={handleChange}
        />
        <div className="absolute inset-y-1 right-1 flex justify-end">
          {submitted && error == '' ? (
            <span className="flex items-center pr-2 text-neutral-500 text-sm">Submitted!</span>
          ) : (
            <button
              type="submit"
              aria-label="Submit"
              className="flex aspect-square h-full items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-neutral-800"
            >
              <ArrowIcon className="w-4" />
            </button>
          )}
        </div>
      </div>
      {error && <p className="ml-4 mt-2 text-sm text-red-500">{error}</p>}
    </form>
  )
}

export default NewsletterForm

