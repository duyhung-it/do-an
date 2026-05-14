package com.b2b.ecommerce.catalog;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "phone_specs")
class PhoneSpecsEntity {
	@Id
	@GeneratedValue
	private UUID id;
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	private ProductEntity product;
	private String chip;
	private String ram;
	private String storage;
	private String battery;
	private String camera;
	private String frontCamera;
	private String screen;
	private String os;
	private String connectivity;
	private String weight;
	private String dimensions;
	private String waterResistance;
	private String simType;
	private String chargingSpeed;
	private String gpu;

	UUID getId() { return id; }
	ProductEntity getProduct() { return product; }
	String getChip() { return chip; }
	String getRam() { return ram; }
	String getStorage() { return storage; }
	String getBattery() { return battery; }
	String getCamera() { return camera; }
	String getFrontCamera() { return frontCamera; }
	String getScreen() { return screen; }
	String getOs() { return os; }
	String getConnectivity() { return connectivity; }
	String getWeight() { return weight; }
	String getDimensions() { return dimensions; }
	String getWaterResistance() { return waterResistance; }
	String getSimType() { return simType; }
	String getChargingSpeed() { return chargingSpeed; }
	String getGpu() { return gpu; }
}
