"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, ArrowRight, Github, Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login/register logic here
    console.log({ email, password, name, rememberMe })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ConcursoIA</h1>
            <p className="text-gray-600">Sua plataforma inteligente para concursos públicos</p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center">
                {isLogin ? "Entrar na sua conta" : "Criar nova conta"}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin
                  ? "Digite suas credenciais para acessar a plataforma"
                  : "Preencha os dados para criar sua conta"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 rounded-xl"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Lembrar de mim
                      </Label>
                    </div>
                    <Button variant="link" className="px-0 text-sm">
                      Esqueceu a senha?
                    </Button>
                  </div>
                )}

                <Button type="submit" className="w-full rounded-xl" size="lg">
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl bg-transparent">
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="rounded-xl bg-transparent">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>

              <div className="text-center">
                <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm">
                  {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Ao continuar, você concorda com nossos{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                Termos de Uso
              </Button>{" "}
              e{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                Política de Privacidade
              </Button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
