import { useParams } from 'react-router-dom';

const ShopHomePage = () => {
  const { id } = useParams(); // "kljldjfl" from /shop/kljldjfl

  // Fetch the shop info using `id`
  // Example: dispatch(fetchShop(id)) or call your API
  return (
    <div>
      <h1>Shop Home Page</h1>
      <p>Shop ID: {id}</p>
    </div>
  );
};

export default ShopHomePage;
