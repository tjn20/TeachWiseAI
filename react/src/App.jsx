import ProtectedRoute from './Routes/ProtectedRoute'
import { Route, Routes } from 'react-router-dom'
import AuthProvider from './Context/AuthProvider'
import Home from './Pages/Home'
import VerificationNotifcation from './Pages/Auth/VerifyEmail'
import VerificationProcessing from './Pages/Auth/VerificationProcessing'
import AuthenicationRoute from './Routes/AuthenicationRoute'
import VerificationRoute from './Routes/VerificationRoute'
import { Toaster } from 'sonner'
import GuestLayout from './Layouts/GuestLayout'
import AuthenticatedLayout from './Layouts/AuthenticatedLayout'
import ChatLayout from './Layouts/ChatLayout'
import CreateCourse from './Pages/CreateCourse'
import EventProvider from './Context/EventProvider'
import { ThemeProvider } from './Context/theme-provider'
import ViewCourse from './Pages/ViewCourse'
import EditCourse from './Pages/EditCourse'
import RegisterForm from './Pages/Auth/RegisterForm'
import LoginForm from './Pages/Auth/LoginForm'
function App() {

return <AuthProvider emailVerification>
<ThemeProvider storageKey="teachwiseai-theme">
  <EventProvider>
      <Routes>
        <Route path="/" element={<AuthenicationRoute><GuestLayout /></AuthenicationRoute>}>
          <Route path="register" element={<RegisterForm />} />
          <Route path="login" element={<LoginForm />} />
      </Route>
      <Route element={<GuestLayout />}>
              <Route 
                path="/email/verification-notification" 
                element={
                  <VerificationRoute>
                    <VerificationNotifcation />
                  </VerificationRoute>
                } 
              />
              <Route 
                path="/verify-email/:id/:hash" 
                element={
                  <VerificationRoute>
                    <VerificationProcessing />
                  </VerificationRoute>
                } 
              />
            </Route>

        <Route path="/" element={<ProtectedRoute permission={"view:courses"} children={<AuthenticatedLayout />} />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/" element={<ProtectedRoute permission={"create:course"} children={<AuthenticatedLayout />} />}>
          <Route path="/create/course" element={<CreateCourse />} />
        </Route>

        <Route path="/" element={<ProtectedRoute permission={"view:course"} children={<AuthenticatedLayout />} />}>
          <Route path="/course/:slug" element={<ViewCourse />} />
        </Route>

        <Route path="/" element={<ProtectedRoute permission={"edit:course"} children={<AuthenticatedLayout />} />}>
          <Route path="/edit/course/:slug" element={<EditCourse />} />
        </Route>

        <Route path="/chat/:id" element={<ProtectedRoute permission={"view:course-conversation"} children={<ChatLayout />} />} />
      </Routes>
  </EventProvider>
</ThemeProvider>
<div>
<Toaster position="top-right" richColors className="me-4" />  
</div>
</AuthProvider>

}

export default App

/* 
<div className="chat-message" key={index}>
<Markdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="code-block-container">
          <SyntaxHighlighter
            style={dracula}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
     );
    },
  }}
>
  {message}
</Markdown>
</div> */