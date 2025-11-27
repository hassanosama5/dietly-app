import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { mealService } from "../services/mealService";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import {
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Plus,
  X,
  Utensils,
} from "lucide-react";

const EMPTY_INGREDIENT = { name: "", amount: "", unit: "g" };
const EMPTY_INSTRUCTION = "";

const createEmptyForm = () => ({
  name: "",
  mealType: "dinner",
  description: "",
  calories: "",
  protein: "",
  carbohydrates: "",
  fats: "",
  servings: "1",
  difficulty: "easy",
  ingredients: [ { ...EMPTY_INGREDIENT } ],
  instructions: [ EMPTY_INSTRUCTION ],
});

const ManageMeals = () => {
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editForm, setEditForm] = useState(createEmptyForm());
  const [addForm, setAddForm] = useState(createEmptyForm());

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await mealService.getMeals();
      setMeals(response.data.data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMeal = (meal) => {
    setSelectedMeal(meal);
    setShowViewModal(true);
  };

  const mapMealToForm = (meal) => ({
    name: meal.name || "",
    mealType: meal.mealType || "dinner",
    description: meal.description || "",
    calories:
      meal?.nutrition?.calories?.toString() ??
      (meal.calories != null ? String(meal.calories) : ""),
    protein:
      meal?.nutrition?.protein != null
        ? String(meal.nutrition.protein)
        : "",
    carbohydrates:
      meal?.nutrition?.carbohydrates != null
        ? String(meal.nutrition.carbohydrates)
        : "",
    fats:
      meal?.nutrition?.fats != null
        ? String(meal.nutrition.fats)
        : "",
    servings:
      meal.servings != null ? String(meal.servings) : "1",
    difficulty: meal.difficulty || "medium",
    ingredients:
      meal.ingredients && meal.ingredients.length > 0
        ? meal.ingredients.map((ing) => ({
            name: ing.name || "",
            amount:
              ing.amount != null ? String(ing.amount) : "",
            unit: ing.unit || "g",
          }))
        : [ { ...EMPTY_INGREDIENT } ],
    instructions:
      meal.instructions && meal.instructions.length > 0
        ? meal.instructions
        : [ EMPTY_INSTRUCTION ],
  });

  const handleEditMeal = (meal) => {
    setSelectedMeal(meal);
    setEditForm(mapMealToForm(meal));
    setShowEditModal(true);
  };

  const buildPayloadFromForm = (form) => {
    const calories = Number(form.calories);
    const protein = Number(form.protein || 0);
    const carbohydrates = Number(form.carbohydrates || 0);
    const fats = Number(form.fats || 0);
    const servings = Number(form.servings || 1);

    // Basic frontend validation for required fields
    if (!form.name.trim()) {
      alert("Meal name is required");
      return null;
    }
    if (!form.mealType) {
      alert("Meal type is required");
      return null;
    }
    if (Number.isNaN(calories)) {
      alert("Calories must be a number");
      return null;
    }

    // At least one ingredient with name + amount + unit
    const ingredients = form.ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        name: ing.name.trim(),
        amount: Number(ing.amount || 0),
        unit: ing.unit || "g",
      }));

    if (ingredients.length === 0) {
      alert("Please add at least one ingredient");
      return null;
    }

    const instructions = form.instructions
      .map((step) => step.trim())
      .filter(Boolean);

    return {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      mealType: form.mealType,
      servings: servings || 1,
      difficulty: form.difficulty || "easy",
      ingredients,
      instructions,
      nutrition: {
        calories,
        protein,
        carbohydrates,
        fats,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      },
    };
  };

  const submitEdit = async () => {
    const payload = buildPayloadFromForm(editForm);
    if (!payload) return;

    try {
      await mealService.updateMeal(selectedMeal._id, payload);
      await fetchMeals();
      setShowEditModal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error(
        "Error updating meal:",
        error.response?.data || error
      );
      alert(
        error.response?.data?.message || "Failed to update meal"
      );
    }
  };

  const handleDeleteMeal = (meal) => {
    setSelectedMeal(meal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await mealService.deleteMeal(selectedMeal._id);
      await fetchMeals();
      setShowDeleteModal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error(
        "Error deleting meal:",
        error.response?.data || error
      );
      alert(
        error.response?.data?.message || "Failed to delete meal"
      );
    }
  };

  const submitAdd = async () => {
    const payload = buildPayloadFromForm(addForm);
    if (!payload) return;

    try {
      await mealService.createMeal(payload);
      await fetchMeals();
      setShowAddModal(false);
      setAddForm(createEmptyForm());
    } catch (error) {
      console.error(
        "Error creating meal:",
        error.response?.data || error
      );
      alert(
        error.response?.data?.message || "Failed to create meal"
      );
    }
  };

  const filteredMeals = meals.filter((meal) => {
    const term = searchTerm.toLowerCase();
    return (
      meal.name?.toLowerCase().includes(term) ||
      meal.mealType?.toLowerCase().includes(term)
    );
  });

  const handleIngredientChange = (formSetter, form, index, field, value) => {
    const updated = form.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    );
    formSetter({ ...form, ingredients: updated });
  };

  const addIngredientRow = (formSetter, form) => {
    formSetter({
      ...form,
      ingredients: [...form.ingredients, { ...EMPTY_INGREDIENT }],
    });
  };

  const removeIngredientRow = (formSetter, form, index) => {
    const updated = form.ingredients.filter((_, i) => i !== index);
    formSetter({
      ...form,
      ingredients: updated.length
        ? updated
        : [ { ...EMPTY_INGREDIENT } ],
    });
  };

  const handleInstructionChange = (
    formSetter,
    form,
    index,
    value
  ) => {
    const updated = form.instructions.map((step, i) =>
      i === index ? value : step
    );
    formSetter({ ...form, instructions: updated });
  };

  const addInstructionRow = (formSetter, form) => {
    formSetter({
      ...form,
      instructions: [...form.instructions, EMPTY_INSTRUCTION],
    });
  };

  const removeInstructionRow = (formSetter, form, index) => {
    const updated = form.instructions.filter((_, i) => i !== index);
    formSetter({
      ...form,
      instructions: updated.length ? updated : [EMPTY_INSTRUCTION],
    });
  };

  const getCaloriesDisplay = (meal) =>
    meal?.nutrition?.calories ?? meal?.calories ?? "—";

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="bg-[#246608]/10 border-b border-[#246608]/20">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate("/admin-dashboard")}
              variant="ghost"
              size="sm"
              className="text-[#246608] hover:bg-[#246608]/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center space-x-3">
              <Utensils className="w-8 h-8 text-[#246608]" />
              <h1 className="text-3xl font-bold">Manage Meals</h1>
            </div>

            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#2F7A0A] to-[#246608]"
            >
              <Plus className="w-4 h-4 mr-2" /> New Meal
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#246608]/20 rounded-lg focus:border-[#246608] transition"
            />
          </div>

          <div className="text-sm text-[#246608]/70 ml-4">
            Total Meals:{" "}
            <span className="font-bold text-[#246608]">
              {meals.length}
            </span>
          </div>
        </div>

        {/* Meals Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#246608]/20 border-t-[#246608] animate-spin rounded-full"></div>
            <p className="mt-4 text-[#246608]/70">Loading meals...</p>
          </div>
        ) : (
          <Card className="border-[#246608]/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#246608]/5 border-b border-[#246608]/20">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold">
                        Name
                      </th>
                      <th className="py-4 px-6 text-left font-semibold">
                        Type
                      </th>
                      <th className="py-4 px-6 text-left font-semibold">
                        Calories
                      </th>
                      <th className="py-4 px-6 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMeals.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-10 text-gray-500"
                        >
                          No meals found
                        </td>
                      </tr>
                    ) : (
                      filteredMeals.map((meal) => (
                        <tr
                          key={meal._id}
                          className="border-b border-[#246608]/10 hover:bg-[#246608]/5"
                        >
                          <td className="py-4 px-6">
                            {meal.name}
                          </td>
                          <td className="py-4 px-6">
                            {meal.mealType}
                          </td>
                          <td className="py-4 px-6">
                            {getCaloriesDisplay(meal)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center space-x-2">
                              <Button
                                onClick={() => handleViewMeal(meal)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={() => handleEditMeal(meal)}
                                variant="ghost"
                                size="sm"
                                className="text-[#246608] hover:bg-[#246608]/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={() => handleDeleteMeal(meal)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#246608]">
                  {selectedMeal.name}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p>
                <strong>Type:</strong> {selectedMeal.mealType}
              </p>
              <p>
                <strong>Calories:</strong>{" "}
                {getCaloriesDisplay(selectedMeal)}
              </p>
              <p>
                <strong>Difficulty:</strong>{" "}
                {selectedMeal.difficulty || "medium"}
              </p>
              <p>
                <strong>Servings:</strong>{" "}
                {selectedMeal.servings || 1}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedMeal.description || "No description"}
              </p>

              {selectedMeal.ingredients &&
                selectedMeal.ingredients.length > 0 && (
                  <div>
                    <strong>Ingredients:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {selectedMeal.ingredients.map((ing, idx) => (
                        <li key={idx}>
                          {ing.amount} {ing.unit} {ing.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedMeal.instructions &&
                selectedMeal.instructions.length > 0 && (
                  <div>
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      {selectedMeal.instructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-[#246608]">
                  Edit Meal
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Basic info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Name
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Meal Type
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={editForm.mealType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        mealType: e.target.value,
                      })
                    }
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded"
                    value={editForm.servings}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        servings: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Difficulty
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={editForm.difficulty}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Nutrition */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  ["calories", "Calories"],
                  ["protein", "Protein (g)"],
                  ["carbohydrates", "Carbs (g)"],
                  ["fats", "Fats (g)"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-1">
                      {label}
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={editForm[key]}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Ingredients</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addIngredientRow(setEditForm, editForm)
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Ingredient
                  </Button>
                </div>

                <div className="space-y-2">
                  {editForm.ingredients.map((ing, index) => (
                    <div
                      key={index}
                      className="grid md:grid-cols-4 gap-2 items-center"
                    >
                      <input
                        className="p-2 border rounded"
                        placeholder="Name"
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(
                            setEditForm,
                            editForm,
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="number"
                        className="p-2 border rounded"
                        placeholder="Amount"
                        value={ing.amount}
                        onChange={(e) =>
                          handleIngredientChange(
                            setEditForm,
                            editForm,
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                      />
                      <select
                        className="p-2 border rounded"
                        value={ing.unit}
                        onChange={(e) =>
                          handleIngredientChange(
                            setEditForm,
                            editForm,
                            index,
                            "unit",
                            e.target.value
                          )
                        }
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                        <option value="piece">piece</option>
                      </select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() =>
                          removeIngredientRow(
                            setEditForm,
                            editForm,
                            index
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Instructions</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addInstructionRow(setEditForm, editForm)
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Step
                  </Button>
                </div>

                <div className="space-y-2">
                  {editForm.instructions.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2"
                    >
                      <span className="mt-2 text-sm font-semibold">
                        {index + 1}.
                      </span>
                      <textarea
                        className="flex-1 p-2 border rounded"
                        rows={2}
                        value={step}
                        onChange={(e) =>
                          handleInstructionChange(
                            setEditForm,
                            editForm,
                            index,
                            e.target.value
                          )
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 mt-1"
                        onClick={() =>
                          removeInstructionRow(
                            setEditForm,
                            editForm,
                            index
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitEdit}
                  className="flex-1 bg-gradient-to-r from-[#2F7A0A] to-[#246608]"
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ADD MEAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-[#246608]">
                  Add New Meal
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Basic info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Name
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Meal Type
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={addForm.mealType}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        mealType: e.target.value,
                      })
                    }
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded"
                    value={addForm.servings}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        servings: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Difficulty
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={addForm.difficulty}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Nutrition */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  ["calories", "Calories"],
                  ["protein", "Protein (g)"],
                  ["carbohydrates", "Carbs (g)"],
                  ["fats", "Fats (g)"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-1">
                      {label}
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={addForm[key]}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Ingredients</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addIngredientRow(setAddForm, addForm)
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Ingredient
                  </Button>
                </div>

                <div className="space-y-2">
                  {addForm.ingredients.map((ing, index) => (
                    <div
                      key={index}
                      className="grid md:grid-cols-4 gap-2 items-center"
                    >
                      <input
                        className="p-2 border rounded"
                        placeholder="Name"
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(
                            setAddForm,
                            addForm,
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="number"
                        className="p-2 border rounded"
                        placeholder="Amount"
                        value={ing.amount}
                        onChange={(e) =>
                          handleIngredientChange(
                            setAddForm,
                            addForm,
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                      />
                      <select
                        className="p-2 border rounded"
                        value={ing.unit}
                        onChange={(e) =>
                          handleIngredientChange(
                            setAddForm,
                            addForm,
                            index,
                            "unit",
                            e.target.value
                          )
                        }
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                        <option value="piece">piece</option>
                      </select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() =>
                          removeIngredientRow(
                            setAddForm,
                            addForm,
                            index
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Instructions</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addInstructionRow(setAddForm, addForm)
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Step
                  </Button>
                </div>

                <div className="space-y-2">
                  {addForm.instructions.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2"
                    >
                      <span className="mt-2 text-sm font-semibold">
                        {index + 1}.
                      </span>
                      <textarea
                        className="flex-1 p-2 border rounded"
                        rows={2}
                        value={step}
                        onChange={(e) =>
                          handleInstructionChange(
                            setAddForm,
                            addForm,
                            index,
                            e.target.value
                          )
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 mt-1"
                        onClick={() =>
                          removeInstructionRow(
                            setAddForm,
                            addForm,
                            index
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitAdd}
                  className="flex-1 bg-gradient-to-r from-[#2F7A0A] to-[#246608]"
                >
                  Add Meal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-red-600">
                Confirm Delete
              </h2>
              <p>
                Do you want to delete{" "}
                <span className="font-bold">
                  {selectedMeal.name}
                </span>
                ?
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>

                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageMeals;
