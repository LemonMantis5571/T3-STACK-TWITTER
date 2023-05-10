import Link from 'next/link';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProfileImage from './ProfileImage';
import { useSession } from 'next-auth/react';
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import IconHoverEffect from './IconHoverEffect';
import { api } from '~/utils/api';
type Tweet = {
  id: string
  content: string
  createdAT: Date
  likeCount: number
  likedByMe: boolean
  user: { id: string; image: string | null; name: string | null };
}

type infiniteTweetListProps = {
  isLoading: boolean;
  IsError: boolean;
  hasmore: boolean | undefined;
  fetchNewTweets: () => Promise<unknown>
  tweets?: Tweet[]
}

export default function InfiniteTweetList({ tweets, IsError, isLoading, fetchNewTweets, hasmore = false }: infiniteTweetListProps) {
  if (isLoading) return <h1>Loading...</h1>
  if (IsError) return <h1>Error...</h1>
  if (tweets == null) return null

  if (tweets === null || tweets?.length === 0) {
    return (<h2 className='my-4 text-center text-2xl text-gray-500'>Is Empty here...</h2>);
  }

  return (<ul>
    <InfiniteScroll dataLength={tweets.length} next={fetchNewTweets} hasMore={hasmore} loader={"Loading..."}>
      {tweets.map((tweet) => {
        return <TweetCard key={tweet.id} {...tweet}></TweetCard>
      })}
    </InfiniteScroll>
  </ul>);
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });

function TweetCard({ id, user, content, createdAT, likeCount, likedByMe }: Tweet) {
  const trpcUtils = api.useContext()
  const toggeLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<typeof trpcUtils.tweet.infiniteFeed.setInfiniteData>[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map(page => {
            return {
              ...page,
              tweets: page.tweets.map(tweet => {
                if (tweet.id === id) {
                  return {
                    ...tweet,
                    likeCount: tweet.likeCount + countModifier,
                    likedByMe: addedLike,
                  }
                }

                return tweet
              })
            }
          })
        }
      }
      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
    }
  })

  function handleToggleLike() {
    toggeLike.mutate({ id })
  }

  return (
    <li className='flex gap-4 border-b px-4 py-4'>
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className='flex flex-grow flex-col'>
        <div className='flex gap-1'>
          <Link href={`/profiles/${user.id}`} className='font-bold hover:underline focus-visible:underline outline-none'>
            {user.name}
          </Link>
          <span className='tex'>-</span>
          <span className='tex'>{dateTimeFormatter.format(createdAT)}</span>
        </div>
        <p className='whiteSpace-pre-wrap'>{content}</p>
        <HeartButton likedByMe={likedByMe} likeCount={likeCount} isLoading={toggeLike.isLoading} onClick={handleToggleLike} />
      </div>
    </li>)
}

type HeartButtonProps = {
  onClick: () => void
  isLoading: boolean
  likedByMe: boolean
  likeCount: number
}

function HeartButton({ isLoading, onClick, likedByMe, likeCount }: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart

  if (session.status !== "authenticated") {
    return <div className='mb-1 mt-2 flex items-center gap-3 self-start text-gray-500'>
      <HeartIcon />
      <span>{likeCount}</span>
    </div>
  }

  return (

    <button disabled={isLoading} onClick={onClick} className={`group -ml-2 items-center gap-1 self-start flex transition-colors duration-200 
    ${likedByMe
        ? "text-red-500"
        : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"}`}>

      <IconHoverEffect red>

        <HeartIcon className={`transition-colors duration-200 ${likedByMe
          ? "fill-red-500 "
          : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"}`} />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  )
}
