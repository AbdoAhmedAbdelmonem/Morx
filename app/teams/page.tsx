"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Users, Copy, Check, Trash2, UserPlus, MoreVertical, CheckCircle2, Sparkles, LayoutGrid, Calendar, Filter, Search, Send, X, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface Team {
  id: string
  name: string
  description: string
  inviteCode: string
  createdBy: string
  members: TeamMember[]
  createdAt: number
}

interface TeamMember {
  username: string
  role: "owner" | "admin" | "member"
  joinedAt: number
}

interface Task {
  id: string
  teamId: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  assignedTo: string | null
  createdBy: string
  createdAt: number
}

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDesc, setNewTeamDesc] = useState("")

  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")

  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [aiHistory, setAiHistory] = useState<{role: string, message: string}[]>([])

  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<Task["status"] | "all">("all")

  useEffect(() => {
    const storedTeams = localStorage.getItem("morx-teams")
    if (storedTeams) setTeams(JSON.parse(storedTeams))

    const storedTasks = localStorage.getItem("morx-tasks")
    if (storedTasks) setTasks(JSON.parse(storedTasks))
  }, [])

  const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase()

  const createTeam = () => {
    if (!newTeamName.trim() || !user) return

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      description: newTeamDesc,
      inviteCode: generateInviteCode(),
      createdBy: user.username,
      members: [{ username: user.username, role: "owner", joinedAt: Date.now() }],
      createdAt: Date.now()
    }

    const updated = [...teams, newTeam]
    setTeams(updated)
    localStorage.setItem("morx-teams", JSON.stringify(updated))
    
    setNewTeamName("")
    setNewTeamDesc("")
    setCreateDialogOpen(false)
    setSelectedTeam(newTeam.id)
  }

  const joinTeam = () => {
    if (!joinCode.trim() || !user) return

    const team = teams.find(t => t.inviteCode === joinCode.toUpperCase())
    if (!team) {
      alert("Invalid invite code")
      return
    }

    if (team.members.some(m => m.username === user.username)) {
      alert("You're already a member of this team")
      return
    }

    const updatedTeam = {
      ...team,
      members: [...team.members, { username: user.username, role: "member" as const, joinedAt: Date.now() }]
    }

    const updated = teams.map(t => t.id === team.id ? updatedTeam : t)
    setTeams(updated)
    localStorage.setItem("morx-teams", JSON.stringify(updated))
    
    setJoinCode("")
    setJoinDialogOpen(false)
    setSelectedTeam(team.id)
  }

  const deleteTeam = (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    const updated = teams.filter(t => t.id !== teamId)
    setTeams(updated)
    localStorage.setItem("morx-teams", JSON.stringify(updated))

    const updatedTasks = tasks.filter(t => t.teamId !== teamId)
    setTasks(updatedTasks)
    localStorage.setItem("morx-tasks", JSON.stringify(updatedTasks))

    if (selectedTeam === teamId) setSelectedTeam(null)
  }

  const createTask = () => {
    if (!newTaskTitle.trim() || !selectedTeam || !user) return

    const newTask: Task = {
      id: Date.now().toString(),
      teamId: selectedTeam,
      title: newTaskTitle,
      description: newTaskDesc,
      status: "todo",
      assignedTo: null,
      createdBy: user.username,
      createdAt: Date.now()
    }

    const updated = [...tasks, newTask]
    setTasks(updated)
    localStorage.setItem("morx-tasks", JSON.stringify(updated))
    
    setNewTaskTitle("")
    setNewTaskDesc("")
    setTaskDialogOpen(false)
  }

  const updateTaskStatus = (taskId: string, status: Task["status"]) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t)
    setTasks(updated)
    localStorage.setItem("morx-tasks", JSON.stringify(updated))
  }

  const assignTask = (taskId: string, username: string | null) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, assignedTo: username } : t)
    setTasks(updated)
    localStorage.setItem("morx-tasks", JSON.stringify(updated))
  }

  const deleteTask = (taskId: string) => {
    if (!confirm("Delete this task?")) return
    const updated = tasks.filter(t => t.id !== taskId)
    setTasks(updated)
    localStorage.setItem("morx-tasks", JSON.stringify(updated))
  }

  const handleAiMessage = () => {
    if (!aiMessage.trim()) return

    const newHistory = [
      ...aiHistory,
      { role: "user", message: aiMessage },
      { role: "assistant", message: "I'm your AI assistant! I can help you manage tasks, summarize team activity, suggest task assignments, and provide insights. Try asking me to analyze your team's progress or create tasks from your description." }
    ]
    setAiHistory(newHistory)
    setAiMessage("")
  }

  const currentTeam = teams.find(t => t.id === selectedTeam)
  let currentTasks = tasks.filter(t => t.teamId === selectedTeam)

  if (searchQuery) {
    currentTasks = currentTasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  if (filterStatus !== "all") {
    currentTasks = currentTasks.filter(t => t.status === filterStatus)
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo": return "bg-gray-500"
      case "in-progress": return "bg-blue-500"
      case "done": return "bg-green-500"
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to access teams</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const viewingTeam = selectedTeam && currentTeam

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {!viewingTeam ? (
          <div className="container px-4 py-8 md:py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Your Teams</h1>
                <p className="text-muted-foreground">Collaborate and manage projects with your teams</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <UserPlus className="mr-2 size-4" />
                      Join Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a Team</DialogTitle>
                      <DialogDescription>Enter the invite code to join an existing team</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="joinCode">Invite Code</Label>
                        <Input
                          id="joinCode"
                          placeholder="ABC123"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          className="uppercase"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={joinTeam}>Join Team</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="mr-2 size-4" />
                      Create Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Team</DialogTitle>
                      <DialogDescription>Set up a team for collaboration</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          placeholder="Marketing Team"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teamDesc">Description</Label>
                        <Textarea
                          id="teamDesc"
                          placeholder="What's this team about?"
                          value={newTeamDesc}
                          onChange={(e) => setNewTeamDesc(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createTeam}>Create Team</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 md:py-24">
                <div className="size-16 md:size-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Users className="size-8 md:size-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">No teams yet</h2>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  Create your first team to start collaborating or join an existing team with an invite code
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg">
                        <Plus className="mr-2 size-5" />
                        Create Your First Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create a New Team</DialogTitle>
                        <DialogDescription>Set up a team for collaboration</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="teamName2">Team Name</Label>
                          <Input
                            id="teamName2"
                            placeholder="Marketing Team"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teamDesc2">Description</Label>
                          <Textarea
                            id="teamDesc2"
                            placeholder="What's this team about?"
                            value={newTeamDesc}
                            onChange={(e) => setNewTeamDesc(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={createTeam}>Create Team</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg">
                        <UserPlus className="mr-2 size-5" />
                        Join a Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Join a Team</DialogTitle>
                        <DialogDescription>Enter the invite code to join an existing team</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="joinCode2">Invite Code</Label>
                          <Input
                            id="joinCode2"
                            placeholder="ABC123"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="uppercase"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={joinTeam}>Join Team</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teams.map((team) => (
                  <Card 
                    key={team.id} 
                    className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="size-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {team.createdBy === user?.username && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTeam(team.id)
                                }} 
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete Team
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {team.description || "No description"}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 3).map((member) => (
                            <Avatar key={member.username} className="size-8 border-2 border-background">
                              <AvatarImage src="/Morx.png" />
                              <AvatarFallback className="text-xs">
                                {member.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {team.members.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{team.members.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {tasks.filter(t => t.teamId === team.id).length} tasks
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Open →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-4rem)]">
            <div className="border-b bg-background/95 backdrop-blur">
              <div className="container flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedTeam(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedTeam(null)}
                    className="hidden md:flex"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Teams
                  </Button>
                  <Separator orientation="vertical" className="h-6 hidden md:block" />
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                      <Users className="size-4" />
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-base md:text-lg font-semibold">{currentTeam.name}</h1>
                      <p className="text-xs text-muted-foreground">{currentTeam.members.length} members</p>
                    </div>
                    <h1 className="text-base font-semibold sm:hidden">{currentTeam.name}</h1>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAiChatOpen(!aiChatOpen)}
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex h-[calc(100vh-7.5rem)]">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b bg-background/95 backdrop-blur">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-4 md:px-6 py-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tasks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-full md:w-64 h-9"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={(value: Task["status"] | "all") => setFilterStatus(value)}>
                        <SelectTrigger className="w-32 h-9">
                          <Filter className="mr-2 size-4" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant={viewMode === "board" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("board")}
                          className="rounded-r-none h-9"
                        >
                          <LayoutGrid className="size-4" />
                          <span className="ml-2 hidden sm:inline">Board</span>
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="rounded-l-none h-9"
                        >
                          <Calendar className="size-4" />
                          <span className="ml-2 hidden sm:inline">List</span>
                        </Button>
                      </div>
                      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="mr-2 size-4" />
                            <span className="hidden sm:inline">New Task</span>
                            <span className="sm:hidden">New</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>Add a task for your team</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="taskTitle">Title</Label>
                              <Input
                                id="taskTitle"
                                placeholder="Task title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="taskDesc">Description</Label>
                              <Textarea
                                id="taskDesc"
                                placeholder="Task details"
                                value={newTaskDesc}
                                onChange={(e) => setNewTaskDesc(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={createTask}>Create Task</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-6 bg-muted/20">
                  {currentTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <CheckCircle2 className="size-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">No tasks found</p>
                      <p className="text-sm">Create a new task to get started</p>
                    </div>
                  ) : (
                    <div className={viewMode === "board" ? "grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-2"}>
                      {viewMode === "board" ? (
                        <>
                          {["todo", "in-progress", "done"].map((status) => {
                            const statusTasks = currentTasks.filter(t => t.status === status)
                            const statusLabel = status === "todo" ? "To Do" : status === "in-progress" ? "In Progress" : "Done"

                            return (
                              <div key={status} className="flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                  <h3 className="text-sm font-semibold">{statusLabel}</h3>
                                  <Badge variant="secondary" className="text-xs">{statusTasks.length}</Badge>
                                </div>
                                <div className="space-y-3">
                                  {statusTasks.map((task) => (
                                    <Card key={task.id} className="hover:shadow-md transition-all hover:border-primary/50">
                                      <CardContent className="p-3 md:p-4">
                                        <div className="space-y-3">
                                          <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-medium text-sm flex-1 line-clamp-2">{task.title}</h4>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-6 shrink-0">
                                                  <MoreVertical className="size-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                                                  <Trash2 className="mr-2 size-4" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                          {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                          )}
                                          
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="flex items-center gap-2 flex-1">
                                              {task.assignedTo ? (
                                                <Avatar className="size-5">
                                                  <AvatarImage src="/Morx.png" />
                                                  <AvatarFallback className="text-xs">
                                                    {task.assignedTo.substring(0, 2).toUpperCase()}
                                                  </AvatarFallback>
                                                </Avatar>
                                              ) : (
                                                <div className="size-5 rounded-full border-2 border-dashed" />
                                              )}
                                              <span className="text-xs text-muted-foreground truncate">
                                                {task.assignedTo ? `@${task.assignedTo}` : "Unassigned"}
                                              </span>
                                            </div>
                                            <Select
                                              value={task.status}
                                              onValueChange={(value: Task["status"]) => updateTaskStatus(task.id, value)}
                                            >
                                              <SelectTrigger className="w-full sm:w-28 h-7 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <Select
                                            value={task.assignedTo || "unassigned"}
                                            onValueChange={(value: string) => assignTask(task.id, value === "unassigned" ? null : value)}
                                          >
                                            <SelectTrigger className="w-full h-7 text-xs">
                                              <SelectValue placeholder="Assign to..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="unassigned">Unassigned</SelectItem>
                                              {currentTeam.members.map(member => (
                                                <SelectItem key={member.username} value={member.username}>
                                                  @{member.username}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </>
                      ) : (
                        <div className="space-y-2">
                          {currentTasks.map((task) => (
                            <Card key={task.id} className="hover:shadow-sm transition-all hover:border-primary/50">
                              <CardContent className="p-3 md:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                  <Badge className={`${getStatusColor(task.status)} shrink-0 w-fit`}>
                                    {task.status}
                                  </Badge>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {task.assignedTo && (
                                      <Avatar className="size-6">
                                        <AvatarImage src="/Morx.png" />
                                        <AvatarFallback className="text-xs">
                                          {task.assignedTo.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteTask(task.id)}
                                      className="size-8"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {aiChatOpen && (
                  <div className="hidden md:flex w-80 border-l bg-background flex-col absolute right-0 top-14 bottom-0">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        <h3 className="font-semibold">AI Assistant</h3>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setAiChatOpen(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                      {aiHistory.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          <Sparkles className="size-8 mx-auto mb-2 opacity-50" />
                          <p>Ask me anything about your tasks!</p>
                          <div className="mt-4 space-y-2">
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setAiMessage("Summarize my team's progress")}>
                              Summarize team progress
                            </Button>
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setAiMessage("What tasks are overdue?")}>
                              Check overdue tasks
                            </Button>
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setAiMessage("Suggest task priorities")}>
                              Suggest priorities
                            </Button>
                          </div>
                        </div>
                      ) : (
                        aiHistory.map((msg, idx) => (
                          <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                            {msg.role === "assistant" && (
                              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Sparkles className="size-4 text-primary" />
                              </div>
                            )}
                            <div className={`rounded-lg p-3 max-w-[80%] text-sm ${
                              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              {msg.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask AI anything..."
                          value={aiMessage}
                          onChange={(e) => setAiMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAiMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleAiMessage} size="icon">
                          <Send className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {aiChatOpen && (
                <div className="md:hidden fixed inset-0 bg-background z-50 flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-primary" />
                      <h3 className="font-semibold">AI Assistant</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setAiChatOpen(false)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {aiHistory.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        <Sparkles className="size-8 mx-auto mb-2 opacity-50" />
                        <p>Ask me anything about your tasks!</p>
                        <div className="mt-4 space-y-2">
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setAiMessage("Summarize my team's progress")}>
                            Summarize team progress
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setAiMessage("What tasks are overdue?")}>
                            Check overdue tasks
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setAiMessage("Suggest task priorities")}>
                            Suggest priorities
                          </Button>
                        </div>
                      </div>
                    ) : (
                      aiHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                          {msg.role === "assistant" && (
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Sparkles className="size-4 text-primary" />
                            </div>
                          )}
                          <div className={`rounded-lg p-3 max-w-[80%] text-sm ${
                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask AI anything..."
                        value={aiMessage}
                        onChange={(e) => setAiMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAiMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleAiMessage} size="icon">
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
