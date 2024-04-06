import { useSession, signIn, signOut } from "next-auth/react"

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
    </div>
  )
  // const { data: session } = useSession()
  // if(session) {
  //   return <>
  //     Signed in as {session.user.email} <br/>
  //     <button onClick={() => signOut()}>Sign out</button>
  //   </>
  // }
  // return <>
  //   Not signed in <br/>
  //   <button onClick={() => signIn()}>Sign in</button>
  // </>
}
