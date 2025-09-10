package com.myapp.ecommerce.dao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.myapp.ecommerce.entity.Product;

//@CrossOrigin("http://localhost:4200") set under MyDataRestConfig
@RepositoryRestResource
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Behind the scene "SELECT * FROM product WHERE category_id=?"
    // Then it will automatically exposes the endpoint
    // http://localhost:8080/api/products/search/findByCategoryId?id=2
    Page<Product> findByCategoryId(@Param("id") Long id, Pageable pageable);

    // Behind the scene "SELECT * FROM Product p WHERE p.name LIKE CONCAT ('%' , :name , '%')
    Page<Product> findByNameContaining(@Param("name")String name, Pageable pageable);

}
