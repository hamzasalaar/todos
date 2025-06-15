// // components/LogoutButton.tsx
// 'use client'

// import { supabase } from "@/lib/supabaseClient"
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"

// const router = useRouter()

// export default function LogoutButton() {
//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     router.push('/auth/login') 
//   }

//   return (
//     <Button variant="destructive" onClick={handleLogout}>
//       Logout
//     </Button>
//   )
// }
