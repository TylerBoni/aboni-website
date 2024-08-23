"use client";


import { useId, useState } from 'react'
import { type Metadata } from 'next'
import Link from 'next/link'

import { Border } from './Border'
import { Button } from './Button'
import { Container } from './Container'
import { FadeIn } from './FadeIn'
import { Offices } from './Offices'
import { PageIntro } from './PageIntro'
import { SocialMedia } from './SocialMedia'

const ContactForm = () => {
  const [data, setData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    budget: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('')


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.name === '' || (data.email === '' && data.phone === '') || data.message === '' || data.budget === '') {
      setError('Please fill out name, email or phone, message, and budget.');
      return
    }

    const res = await fetch('/api/form1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      console.log('Form submitted successfully');
      setError('');
      setSubmitted(true);
    } else {
      console.error('Form submission failed');
      setError('Form submission failed, please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <FadeIn className="lg:order-last">
      <form onSubmit={handleSubmit} >
        <h2 className="font-display text-base font-semibold text-neutral-950">
          Work inquiries
        </h2>
        <div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
          <TextInput label="Name" name="name" autoComplete="name" onChange={handleChange} />
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            onChange={handleChange}
          />
          <TextInput
            label="Company"
            name="company"
            autoComplete="organization"
            onChange={handleChange}
          />
          <TextInput label="Phone" type="tel" name="phone" autoComplete="tel" onChange={handleChange} />
          <TextInput label="Message" name="message" onChange={handleChange} />
          <div className="border border-neutral-300 px-6 py-8 first:rounded-t-2xl last:rounded-b-2xl">
            <fieldset>
              <legend className="text-base/6 text-neutral-500">Budget</legend>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <RadioInput label="$25K – $50K" name="budget" value="25k-50k" onChange={handleChange} />
                <RadioInput label="$50K – $100K" name="budget" value="50k-100k" onChange={handleChange} />
                <RadioInput label="$100K – $150K" name="budget" value="100k-150k" onChange={handleChange} />
                <RadioInput label="More than $150K" name="budget" value="150k+" onChange={handleChange} />
              </div>
            </fieldset>
          </div>
        </div>
        {submitted && <p className="mt-6 text-neutral-950">Thank you for your submission!</p>}
        {!submitted && <Button type="submit" className="mt-10">Let’s work together</Button>}
        {error != '' && <p className="mt-6 text-red-600">{error}</p>}
      </form>
    </FadeIn >
  )
}

function TextInput({
  label,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  let id = useId()

  return (
    <div className="group relative z-0 transition-all focus-within:z-10">
      <input
        type="text"
        id={id}
        {...props}
        placeholder=" "
        className="peer block w-full border border-neutral-300 bg-transparent px-6 pb-4 pt-12 text-base/6 text-neutral-950 ring-4 ring-transparent transition focus:border-neutral-950 focus:outline-none focus:ring-neutral-950/5 group-first:rounded-t-2xl group-last:rounded-b-2xl"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-6 top-1/2 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-neutral-950"
      >
        {label}
      </label>
    </div>
  )
}

function RadioInput({
  label,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  return (
    <label className="flex gap-x-3">
      <input
        type="radio"
        {...props}
        className="h-6 w-6 flex-none appearance-none rounded-full border border-neutral-950/20 outline-none checked:border-[0.5rem] checked:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      />
      <span className="text-base/6 text-neutral-950">{label}</span>
    </label>
  )
}

export default ContactForm
