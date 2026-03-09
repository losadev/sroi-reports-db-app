import React from 'react'

type Props = {
    children: React.ReactNode
}

function Reports({children}: Props) {
  return (
    <main>{children}</main>
  )
}

export default Reports