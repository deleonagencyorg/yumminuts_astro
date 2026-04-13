// src/services/api/client.ts
 const apiUrl = import.meta.env.PUBLIC_CMS_URL;    
  const token = import.meta.env.PUBLIC_CMS_TOKEN;     

  let cmsRecipes = [];
  try {
    const response = await fetch(`${apiUrl}/v1/recipes?page=1&pageSize=30&brandSlug=bd7b23b4-d8b7-4aea-9f28-6ce6d1927d69&languageCode=${locale}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      cmsRecipes = [...data.data];
      console.log(`Recetas obtenidas del CMS: ${data}`, data);
      cmsRecipes = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        image: item.image?.url || '/images/recipes/placeholder.jpg',
        
        preparation_time: item.preparation_time,
        category: item.category
      }));

      for (const cmsRecipe of cmsRecipes) {
    const recipe = cmsRecipe ;
    if (!recipe?.id) continue;
    paths.push({
      params: { lang: locale, recipeId: recipe.id },
      props: { recipe, currentLang: locale }
    });
  }
  console.log(`Generadas ${paths.length} rutas de recetas en español`);
  return paths;


    } else {
      console.error('Error fetching:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching:', error);
  }
console.log(`Recetas obtenidas del CMS: ${cmsRecipes.length}`);

