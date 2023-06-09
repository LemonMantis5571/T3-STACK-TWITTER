import React, { FormEvent, useCallback, useLayoutEffect, useRef, useState } from 'react'
import Button from './Button'
import ProfileImage from './ProfileImage'
import { useSession } from 'next-auth/react'
import { api } from '~/utils/api'

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return
  textArea.style.height = "0"
  textArea.style.height = `${textArea.scrollHeight}.px`
}

function Form() {
  const session = useSession();
  const [inputValue, setinputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();

  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, [])

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current)
  }, [inputValue]);

  const createTweet = api.tweet.create.useMutation({
    onSuccess: newTweet => {
      setinputValue("");
      console.log(newTweet);
    }
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    createTweet.mutate({ content: inputValue });
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2 border-2 px-4 py-2'>
      <div className='flex gap-4'>
        <ProfileImage src={session.data?.user.image} />
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setinputValue(e.target.value)}
          style={{ height: 0 }}
          className='flex-grow resize-none overflow-hidden p-4 text-lg outline-none' placeholder="What's happening?" />
      </div>
      <Button className='self-end' type='submit'>Tweet</Button>
    </form>
  )
}

export default function NewTweetForm() {

  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <Form />

}
