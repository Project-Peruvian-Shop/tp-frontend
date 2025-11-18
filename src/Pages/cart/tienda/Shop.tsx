import { useEffect, useState } from "react";
import Products from "../../../Components/shop/products/Products";
import Sidebar from "../../../Components/shop/sidebar/Sidebar";
import SubHeader from "../../../Components/shop/subheader/SubHeader";
import styles from "./Shop.module.css";
import { getPaginatedProductos } from "../../../services/producto.service";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import type { PaginatedProductoResponseDTO } from "../../../models/Producto/Producto_response_dto";
import Pagination from "../../../Components/pagination/Pagination";
import type { AllAndQuantityResponseDTO } from "../../../models/Categoria/Categoria_response";
import { getCategoriaAllQuantity } from "../../../services/categoria.service";
import { useSearchParams } from "react-router-dom";
import { Loader } from "../../../Components/loader/loader";

const Shop = () => {
  const [pageData, setPageData] =
    useState<PaginatedResponse<PaginatedProductoResponseDTO> | null>(null);
  const [categoriesData, setCategoriesData] = useState<
    AllAndQuantityResponseDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [searchParams] = useSearchParams();
  const categoriaIdFromUrl = searchParams.get("categoriaId");

  useEffect(() => {
    if (categoriaIdFromUrl) {
      setSelectedCategory(Number(categoriaIdFromUrl));
      setPage(0);
    }
  }, [categoriaIdFromUrl]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const response = await getPaginatedProductos(
          page,
          12,
          selectedCategory
        );
        const responseCategories = await getCategoriaAllQuantity();

        setCategoriesData(responseCategories);
        setPageData(response);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [page, selectedCategory]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  return (
    <>
      <SubHeader title="Tienda" />

      <div className={styles.shopContainer}>
        <Sidebar
          arrayCategories={categoriesData}
          onCategoryClick={handleCategoryClick}
        />

        <div className={styles.productsSection}>
          {loading ? (
            <Loader message="Cargando productos..." />
          ) : (
            <>
              {pageData && <Products result={pageData.content} />}

              {pageData && (
                <Pagination
                  currentPage={pageData.number}
                  totalPages={pageData.totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
