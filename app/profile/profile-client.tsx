"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProfileAction, changePasswordAction, deleteAccountAction, FormState } from "@/app/actions/profile";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Trash2, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePageClientProps {
  session: {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      selectedReligion?: string | null;
    };
  };
}

const religionOptions = [
  { id: "orthodox", name: "Eastern Orthodox" },
  { id: "catholic", name: "Roman Catholic" },
  { id: "protestant", name: "Protestant" },
  { id: "anglican", name: "Anglican/Episcopal" },
  { id: "baptist", name: "Baptist" },
  { id: "methodist", name: "Methodist" },
  { id: "pentecostal", name: "Pentecostal" },
  { id: "mormon", name: "LDS/Mormon" },
  { id: "other", name: "Other/Exploring" },
];

const initialState: FormState = { success: false };

export default function ProfilePageClient({ session }: ProfilePageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedReligion, setSelectedReligion] = useState(session.user.selectedReligion || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form state
  const [profileState, profileAction] = useFormState(updateProfileAction, initialState);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [passwordState, passwordAction] = useFormState(changePasswordAction, initialState);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (profileState.success) {
      toast.success(profileState.message || "Profile updated");
      setIsUpdatingProfile(false);
      router.refresh();
    } else if (profileState.message && !isUpdatingProfile) {
      toast.error(profileState.message);
    }
  }, [profileState, router, isUpdatingProfile]);

  useEffect(() => {
    if (passwordState.success) {
      toast.success(passwordState.message || "Password changed");
      setIsChangingPassword(false);
    } else if (passwordState.message && !isChangingPassword) {
      toast.error(passwordState.message);
    }
  }, [passwordState, isChangingPassword]);

  const handleProfileSubmit = async (formData: FormData) => {
    if (selectedReligion) {
      formData.set("selectedReligion", selectedReligion);
    }
    setIsUpdatingProfile(true);
    profileAction(formData);
  };

  const handlePasswordSubmit = async (formData: FormData) => {
    setIsChangingPassword(true);
    passwordAction(formData);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccountAction(deletePassword);
    
    if (result.success) {
      toast.success("Account deleted successfully");
      await signOutAction();
    } else {
      toast.error(result.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF8F3] via-white to-byzantine-50/30">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/chat">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
          <h1 className="text-4xl font-display font-bold text-orthodox-600 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile, security, and account preferences
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-display font-bold text-orthodox-600 mb-6">
                Profile Information
              </h2>

              {profileState.success && (
                <Alert className="mb-6 border-green-300 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {profileState.message}
                  </AlertDescription>
                </Alert>
              )}

              <form action={handleProfileSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-byzantine-100 text-byzantine-700">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      type="url"
                      defaultValue={session.user.avatar || ""}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={isUpdatingProfile}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a URL to your avatar image
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={session.user.name || ""}
                    required
                    disabled={isUpdatingProfile}
                  />
                  {profileState.errors?.name && (
                    <p className="text-sm text-red-600">{profileState.errors.name[0]}</p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={session.user.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Religion */}
                <div className="space-y-2">
                  <Label htmlFor="selectedReligion">Faith Tradition</Label>
                  <Select
                    value={selectedReligion}
                    onValueChange={setSelectedReligion}
                    disabled={isUpdatingProfile}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your faith tradition" />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((religion) => (
                        <SelectItem key={religion.id} value={religion.id}>
                          {religion.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-byzantine-500 hover:bg-byzantine-600"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="p-6">
              <h2 className="text-2xl font-display font-bold text-orthodox-600 mb-6">
                Change Password
              </h2>

              {passwordState.success && (
                <Alert className="mb-6 border-green-300 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {passwordState.message}
                  </AlertDescription>
                </Alert>
              )}

              <form action={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    disabled={isChangingPassword}
                  />
                  {passwordState.errors?.currentPassword && (
                    <p className="text-sm text-red-600">{passwordState.errors.currentPassword[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    disabled={isChangingPassword}
                  />
                  <p className="text-xs text-gray-500">
                    At least 8 characters with uppercase, lowercase, and number
                  </p>
                  {passwordState.errors?.newPassword && (
                    <p className="text-sm text-red-600">{passwordState.errors.newPassword[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={isChangingPassword}
                  />
                  {passwordState.errors?.confirmPassword && (
                    <p className="text-sm text-red-600">{passwordState.errors.confirmPassword[0]}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-byzantine-500 hover:bg-byzantine-600"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="p-6 border-red-200">
              <h2 className="text-2xl font-display font-bold text-red-600 mb-6">
                Delete Account
              </h2>

              <Alert className="mb-6 border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Warning:</strong> This action is permanent and cannot be undone.
                  All your conversations and data will be permanently deleted.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  Delete My Account
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Please enter your password to confirm account deletion:
                  </p>
                  
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={isDeleting}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword("");
                      }}
                      disabled={isDeleting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword}
                      className="flex-1"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Confirm Delete"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

