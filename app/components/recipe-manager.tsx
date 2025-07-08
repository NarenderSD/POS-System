"use client"

import { useState, useEffect } from "react"
import { 
  ChefHat, 
  Clock, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Scale,
  Thermometer,
  Timer,
  BookOpen,
  Star,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Recipe {
  id: string
  name: string
  nameHindi?: string
  category: string
  description: string
  preparationTime: number
  cookingTime: number
  servings: number
  difficulty: "easy" | "medium" | "hard"
  ingredients: RecipeIngredient[]
  instructions: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  costPerServing: number
  sellingPrice: number
  profitMargin: number
  tags: string[]
  image?: string
  isVeg: boolean
  spiceLevel?: "mild" | "medium" | "hot"
  allergens?: string[]
  chefNotes?: string
  rating?: number
  timesCooked: number
}

interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  costPerUnit: number
  totalCost: number
}

export default function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: "",
    category: "",
    description: "",
    preparationTime: 0,
    cookingTime: 0,
    servings: 1,
    difficulty: "medium",
    ingredients: [],
    instructions: [],
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
    costPerServing: 0,
    sellingPrice: 0,
    profitMargin: 0,
    tags: [],
    isVeg: true,
  })

  const categories = ["main-course", "starters", "breads", "rice", "desserts", "beverages", "soups", "salads"]
  const difficulties = ["easy", "medium", "hard"]
  const units = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup", "pinch"]

  // Initialize sample recipes
  useEffect(() => {
    const sampleRecipes: Recipe[] = [
      {
        id: "1",
        name: "Butter Chicken",
        nameHindi: "बटर चिकन",
        category: "main-course",
        description: "Creamy tomato-based chicken curry with rich spices",
        preparationTime: 30,
        cookingTime: 45,
        servings: 4,
        difficulty: "medium",
        ingredients: [
          { name: "Chicken", quantity: 500, unit: "g", costPerUnit: 200, totalCost: 100 },
          { name: "Tomatoes", quantity: 300, unit: "g", costPerUnit: 40, totalCost: 12 },
          { name: "Cream", quantity: 200, unit: "ml", costPerUnit: 80, totalCost: 16 },
          { name: "Butter", quantity: 50, unit: "g", costPerUnit: 120, totalCost: 6 },
          { name: "Spices", quantity: 20, unit: "g", costPerUnit: 300, totalCost: 6 },
        ],
        instructions: [
          "Marinate chicken with yogurt and spices for 30 minutes",
          "Grill chicken until charred",
          "Prepare tomato gravy with onions and spices",
          "Add grilled chicken to gravy",
          "Finish with cream and butter",
        ],
        nutritionInfo: {
          calories: 450,
          protein: 35,
          carbs: 15,
          fat: 28,
          fiber: 3,
        },
        costPerServing: 35,
        sellingPrice: 320,
        profitMargin: 814,
        tags: ["popular", "creamy", "signature"],
        isVeg: false,
        spiceLevel: "medium",
        allergens: ["dairy"],
        chefNotes: "Ensure chicken is properly marinated for best flavor",
        rating: 4.8,
        timesCooked: 156,
      },
      {
        id: "2",
        name: "Paneer Butter Masala",
        nameHindi: "पनीर बटर मसाला",
        category: "main-course",
        description: "Rich and creamy paneer curry with aromatic spices",
        preparationTime: 20,
        cookingTime: 25,
        servings: 3,
        difficulty: "easy",
        ingredients: [
          { name: "Paneer", quantity: 300, unit: "g", costPerUnit: 400, totalCost: 120 },
          { name: "Tomatoes", quantity: 250, unit: "g", costPerUnit: 40, totalCost: 10 },
          { name: "Cream", quantity: 150, unit: "ml", costPerUnit: 80, totalCost: 12 },
          { name: "Butter", quantity: 40, unit: "g", costPerUnit: 120, totalCost: 4.8 },
          { name: "Spices", quantity: 15, unit: "g", costPerUnit: 300, totalCost: 4.5 },
        ],
        instructions: [
          "Cut paneer into cubes and set aside",
          "Prepare tomato gravy with spices",
          "Add paneer cubes to gravy",
          "Simmer for 5-7 minutes",
          "Finish with cream and butter",
        ],
        nutritionInfo: {
          calories: 380,
          protein: 18,
          carbs: 12,
          fat: 32,
          fiber: 2,
        },
        costPerServing: 50,
        sellingPrice: 280,
        profitMargin: 460,
        tags: ["vegetarian", "popular", "creamy"],
        isVeg: true,
        spiceLevel: "mild",
        allergens: ["dairy"],
        chefNotes: "Use fresh paneer for best texture",
        rating: 4.6,
        timesCooked: 89,
      },
    ]

    setRecipes(sampleRecipes)
  }, [])

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.nameHindi?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || recipe.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const totalRecipes = recipes.length
  const totalCost = recipes.reduce((sum, recipe) => sum + recipe.costPerServing * recipe.servings, 0)
  const totalRevenue = recipes.reduce((sum, recipe) => sum + recipe.sellingPrice, 0)
  const averageRating = recipes.length > 0 ? recipes.reduce((sum, recipe) => sum + (recipe.rating || 0), 0) / recipes.length : 0

  const handleAddRecipe = () => {
    if (newRecipe.name && newRecipe.category) {
      const recipe: Recipe = {
        id: Date.now().toString(),
        name: newRecipe.name,
        category: newRecipe.category,
        description: newRecipe.description || "",
        preparationTime: newRecipe.preparationTime || 0,
        cookingTime: newRecipe.cookingTime || 0,
        servings: newRecipe.servings || 1,
        difficulty: newRecipe.difficulty || "medium",
        ingredients: newRecipe.ingredients || [],
        instructions: newRecipe.instructions || [],
        nutritionInfo: newRecipe.nutritionInfo || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
        costPerServing: newRecipe.costPerServing || 0,
        sellingPrice: newRecipe.sellingPrice || 0,
        profitMargin: newRecipe.profitMargin || 0,
        tags: newRecipe.tags || [],
        isVeg: newRecipe.isVeg || true,
        timesCooked: 0,
      }
      setRecipes([...recipes, recipe])
      setNewRecipe({
        name: "",
        category: "",
        description: "",
        preparationTime: 0,
        cookingTime: 0,
        servings: 1,
        difficulty: "medium",
        ingredients: [],
        instructions: [],
        nutritionInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
        costPerServing: 0,
        sellingPrice: 0,
        profitMargin: 0,
        tags: [],
        isVeg: true,
      })
      setIsAddDialogOpen(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-300"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "hard": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case "mild": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "hot": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Recipe Manager
          </h2>
          <p className="text-muted-foreground">
            Manage recipes, ingredients, and cooking instructions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipe Name</Label>
                  <Input
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                    placeholder="Recipe name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe({...newRecipe, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                  placeholder="Recipe description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Prep Time (min)</Label>
                  <Input
                    type="number"
                    value={newRecipe.preparationTime}
                    onChange={(e) => setNewRecipe({...newRecipe, preparationTime: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Cooking Time (min)</Label>
                  <Input
                    type="number"
                    value={newRecipe.cookingTime}
                    onChange={(e) => setNewRecipe({...newRecipe, cookingTime: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe({...newRecipe, servings: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Difficulty</Label>
                  <Select value={newRecipe.difficulty} onValueChange={(value) => setNewRecipe({...newRecipe, difficulty: value as Recipe["difficulty"]})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cost per Serving</Label>
                  <Input
                    type="number"
                    value={newRecipe.costPerServing}
                    onChange={(e) => setNewRecipe({...newRecipe, costPerServing: Number(e.target.value)})}
                    placeholder="₹"
                  />
                </div>
              </div>
              <Button onClick={handleAddRecipe} className="w-full">
                Add Recipe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipes}</div>
            <div className="text-xs text-muted-foreground">Available recipes</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCost.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Ingredient costs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Out of 5 stars</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Potential revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficulties.map(difficulty => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recipes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{recipe.name}</div>
                      {recipe.nameHindi && (
                        <div className="text-sm text-muted-foreground">{recipe.nameHindi}</div>
                      )}
                      <div className="text-xs text-muted-foreground">{recipe.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.preparationTime + recipe.cookingTime} min</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {recipe.servings} servings
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>₹{recipe.costPerServing}</div>
                    <div className="text-xs text-muted-foreground">
                      per serving
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {recipe.rating?.toFixed(1) || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {recipe.timesCooked} times
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecipe(recipe)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // View recipe details
                        }}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recipe Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recipe Details</DialogTitle>
          </DialogHeader>
          {selectedRecipe && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Recipe Name</Label>
                    <Input defaultValue={selectedRecipe.name} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select defaultValue={selectedRecipe.category}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea defaultValue={selectedRecipe.description} rows={3} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input type="number" defaultValue={selectedRecipe.preparationTime} />
                  </div>
                  <div>
                    <Label>Cooking Time (min)</Label>
                    <Input type="number" defaultValue={selectedRecipe.cookingTime} />
                  </div>
                  <div>
                    <Label>Servings</Label>
                    <Input type="number" defaultValue={selectedRecipe.servings} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ingredients" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell>{ingredient.quantity}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell>₹{ingredient.totalCost}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="instructions" className="space-y-4">
                <div className="space-y-2">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                      <Textarea defaultValue={instruction} rows={2} />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="nutrition" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Calories</Label>
                    <Input type="number" defaultValue={selectedRecipe.nutritionInfo.calories} />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input type="number" defaultValue={selectedRecipe.nutritionInfo.protein} />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input type="number" defaultValue={selectedRecipe.nutritionInfo.carbs} />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input type="number" defaultValue={selectedRecipe.nutritionInfo.fat} />
                  </div>
                </div>
              </TabsContent>
              
              <Button 
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full mt-4"
              >
                Update Recipe
              </Button>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 