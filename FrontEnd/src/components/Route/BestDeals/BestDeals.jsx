import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../../redux/actions/product";
import { useEffect } from "react";
import ProductCard from "../ProductCard/ProductCard.jsx";
import styles from "../../../styles/styles";

const BestDeals = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const firstFive = products?.slice(0, 4);

  return (
    <div>
      <div className={`${styles.section}`}>
        <div className={`${styles.heading}`}>
          <h1>Best Deals</h1>
        </div>

        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
          {firstFive?.map((i, index) => (
            <ProductCard key={index} data={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BestDeals;
