package com.myapp.ecommerce.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.myapp.ecommerce.entity.Customer;

@RepositoryRestResource (exported = false)
public interface CustomerRepository extends JpaRepository<Customer,Long> {

    Customer findByEmail (String theEmail);

}
