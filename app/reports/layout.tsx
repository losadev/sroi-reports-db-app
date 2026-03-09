import React from 'react'

type Props = {
    children: React.ReactNode
}

function Reports({children}: Props) {
  return (
    <main className="h-full overflow-hidden">{children}</main>
  )
}

export default Reports