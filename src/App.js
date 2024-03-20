import Message from "./Components/Message";
import { useEffect, useRef, useState } from "react";
import app from "./firebase";
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

// LoginHandler
const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};
// LogoutHandler
const logoutHandler = () => signOut(auth);

const App = () => {
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const divforScroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    const hasContent = /\S/.test(message);

    if (hasContent) {
      try {
        setMessage("");

        await addDoc(collection(db, "Message"), {
          text: message,
          uid: user.providerData[0].uid,
          uri: user.photoURL,
          createdAt: serverTimestamp(),
        });

        divforScroll.current.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        alert(error.message);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    const q = query(collection(db, "Message"), orderBy("createdAt", "asc"));
    const unsubscribeForMessage = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
    });

    return () => {
      unsubscribe();
      unsubscribeForMessage();
    };
  }, []);

  return (
    <Box bg={"red.50"}>
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack h={"full"} py={"4"}>
            <Button onClick={logoutHandler} colorScheme="red" w={"full"}>
              Logout
            </Button>
            <VStack h={"full"} w={"full"} overflowY={"auto"} css={{"&::-webkit-scrollbar": {display: 'none'}}}>
              {messages.map((item) => (
                <Message
                  user={item.uid === user.providerData[0].uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                  key={item.id}
                />
              ))}

              <div ref={divforScroll} />
            </VStack>
            <form onSubmit={submitHandler} style={{ width: "100%" }}>
              <HStack>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter a Message.."
                />
                <Button colorScheme="purple" type="submit">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack justifyContent={"center"} h={"100vh"}>
          <Button onClick={loginHandler} colorScheme="purple">
            Sign In With Google
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default App;
