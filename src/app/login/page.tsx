'use client';

import { useRouter } from 'next/navigation';
import { useImmer } from 'use-immer';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Music, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
} from '@/components';
import { loginSchema } from '@/schemas';
import { useLoginMutation } from '@/hooks';

export default function Login() {
  const router = useRouter();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const { mutate, isPending } = useLoginMutation({
    onSuccess: () => {
      void router.replace('/');
    },
  });

  const [state, setState] = useImmer({
    showPassword: false,
  });

  const { showPassword } = state;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Music className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Music Player
          </h1>
          <p className="text-gray-600">
            Sign in to access your personal music library
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-gray-900">
              Welcome
            </CardTitle>
            {/*<CardDescription className="text-center text-gray-600">*/}
            {/*  Choose your preferred way to continue*/}
            {/*</CardDescription>*/}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              {/*<TabsList className="grid w-full grid-cols-2 mb-6">*/}
              {/*  <TabsTrigger*/}
              {/*    value="login"*/}
              {/*    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"*/}
              {/*  >*/}
              {/*    Sign In*/}
              {/*  </TabsTrigger>*/}
              {/*  <TabsTrigger*/}
              {/*    value="signup"*/}
              {/*    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"*/}
              {/*  >*/}
              {/*    Sign Up*/}
              {/*  </TabsTrigger>*/}
              {/*</TabsList>*/}

              <TabsContent value="login" className="space-y-4">
                <form
                  onSubmit={handleSubmit((data) => {
                    mutate(data);
                  })}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            // type="email"
                            placeholder="Enter your email"
                            className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            {...field}
                          />
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onMouseDown={() => {
                          setState((draft) => {
                            draft.showPassword = true;
                          });
                        }}
                        onMouseUp={() => {
                          setState((draft) => {
                            draft.showPassword = false;
                          });
                        }}
                        onMouseLeave={() => {
                          setState((draft) => {
                            draft.showPassword = false;
                          });
                        }}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 text-gray-600">
                      <Controller
                        name="remember"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        )}
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 music-button-hover"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/*<TabsContent value="signup" className="space-y-4">*/}
              {/*  <form onSubmit={handleSignup} className="space-y-4">*/}
              {/*    <div className="space-y-2">*/}
              {/*      <Label htmlFor="name" className="text-gray-700 font-medium">*/}
              {/*        Full Name*/}
              {/*      </Label>*/}
              {/*      <div className="relative">*/}
              {/*        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />*/}
              {/*        <Input*/}
              {/*          id="name"*/}
              {/*          type="text"*/}
              {/*          placeholder="Enter your full name"*/}
              {/*          value={signupForm.name}*/}
              {/*          onChange={(e) =>*/}
              {/*            setSignupForm({ ...signupForm, name: e.target.value })*/}
              {/*          }*/}
              {/*          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"*/}
              {/*          required*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div className="space-y-2">*/}
              {/*      <Label*/}
              {/*        htmlFor="signup-email"*/}
              {/*        className="text-gray-700 font-medium"*/}
              {/*      >*/}
              {/*        Email*/}
              {/*      </Label>*/}
              {/*      <div className="relative">*/}
              {/*        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />*/}
              {/*        <Input*/}
              {/*          id="signup-email"*/}
              {/*          type="email"*/}
              {/*          placeholder="Enter your email"*/}
              {/*          value={signupForm.email}*/}
              {/*          onChange={(e) =>*/}
              {/*            setSignupForm({*/}
              {/*              ...signupForm,*/}
              {/*              email: e.target.value,*/}
              {/*            })*/}
              {/*          }*/}
              {/*          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"*/}
              {/*          required*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div className="space-y-2">*/}
              {/*      <Label*/}
              {/*        htmlFor="signup-password"*/}
              {/*        className="text-gray-700 font-medium"*/}
              {/*      >*/}
              {/*        Password*/}
              {/*      </Label>*/}
              {/*      <div className="relative">*/}
              {/*        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />*/}
              {/*        <Input*/}
              {/*          id="signup-password"*/}
              {/*          type={showPassword ? 'text' : 'password'}*/}
              {/*          placeholder="Create a password"*/}
              {/*          value={signupForm.password}*/}
              {/*          onChange={(e) =>*/}
              {/*            setSignupForm({*/}
              {/*              ...signupForm,*/}
              {/*              password: e.target.value,*/}
              {/*            })*/}
              {/*          }*/}
              {/*          className="pl-10 pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"*/}
              {/*          required*/}
              {/*        />*/}
              {/*        <button*/}
              {/*          type="button"*/}
              {/*          onClick={() => setShowPassword(!showPassword)}*/}
              {/*          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"*/}
              {/*        >*/}
              {/*          {showPassword ? (*/}
              {/*            <EyeOff className="h-4 w-4" />*/}
              {/*          ) : (*/}
              {/*            <Eye className="h-4 w-4" />*/}
              {/*          )}*/}
              {/*        </button>*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div className="space-y-2">*/}
              {/*      <Label*/}
              {/*        htmlFor="confirm-password"*/}
              {/*        className="text-gray-700 font-medium"*/}
              {/*      >*/}
              {/*        Confirm Password*/}
              {/*      </Label>*/}
              {/*      <div className="relative">*/}
              {/*        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />*/}
              {/*        <Input*/}
              {/*          id="confirm-password"*/}
              {/*          type={showPassword ? 'text' : 'password'}*/}
              {/*          placeholder="Confirm your password"*/}
              {/*          value={signupForm.confirmPassword}*/}
              {/*          onChange={(e) =>*/}
              {/*            setSignupForm({*/}
              {/*              ...signupForm,*/}
              {/*              confirmPassword: e.target.value,*/}
              {/*            })*/}
              {/*          }*/}
              {/*          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"*/}
              {/*          required*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div className="text-sm">*/}
              {/*      <label className="flex items-start space-x-2 text-gray-600">*/}
              {/*        <input*/}
              {/*          type="checkbox"*/}
              {/*          className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"*/}
              {/*          required*/}
              {/*        />*/}
              {/*        <span>*/}
              {/*          I agree to the{' '}*/}
              {/*          <button*/}
              {/*            type="button"*/}
              {/*            className="text-orange-500 hover:text-orange-600 font-medium"*/}
              {/*          >*/}
              {/*            Terms of Service*/}
              {/*          </button>{' '}*/}
              {/*          and{' '}*/}
              {/*          <button*/}
              {/*            type="button"*/}
              {/*            className="text-orange-500 hover:text-orange-600 font-medium"*/}
              {/*          >*/}
              {/*            Privacy Policy*/}
              {/*          </button>*/}
              {/*        </span>*/}
              {/*      </label>*/}
              {/*    </div>*/}

              {/*    <Button*/}
              {/*      type="submit"*/}
              {/*      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 music-button-hover"*/}
              {/*      disabled={isLoading}*/}
              {/*    >*/}
              {/*      {isLoading ? (*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />*/}
              {/*          <span>Creating account...</span>*/}
              {/*        </div>*/}
              {/*      ) : (*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <span>Create Account</span>*/}
              {/*          <ArrowRight className="w-4 h-4" />*/}
              {/*        </div>*/}
              {/*      )}*/}
              {/*    </Button>*/}
              {/*  </form>*/}
              {/*</TabsContent>*/}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure login powered by advanced encryption</p>
        </div>
      </div>
    </div>
  );
}
