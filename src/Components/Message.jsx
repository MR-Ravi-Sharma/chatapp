import { Avatar, HStack,Text } from '@chakra-ui/react'
import React from 'react'

const Message = ({ text, url, user = 'other' }) => {

  return (
    <HStack 
    borderRadius={'base'} 
    bg={'gray.100'} 
    px={user === 'me'? '4': '2'} 
    py={'2'}
    alignSelf={user === 'me'? 'flex-end': 'flex-start'}
    > 
      {
        user === 'other' && <Avatar src={url} />
      }
      <Text wordBreak={'break-all'}>{text}</Text>
      {
        user === 'me' && <Avatar src={url} />
      }
    </HStack>
  )
}

export default Message